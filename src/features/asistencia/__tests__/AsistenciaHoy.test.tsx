import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";

import { AsistenciaHoy } from "../components/AsistenciaHoy";
import { INTERVALO_ACTUALIZACION_MS } from "../hooks/useAsistenciaHoy";
import type {
    AsistenciaHoy as AsistenciaHoyDatos,
    EmpleadoAsistenciaHoy,
} from "../interfaces/types";
import { asistenciaService } from "../services/asistenciaService";

const consultarHoy = vi.spyOn(asistenciaService, "consultarHoy");

/** Entrada a las 8:00 a. m. (hora de Colombia). */
const ANA: EmpleadoAsistenciaHoy = {
    employeeId: 1,
    firstName: "Ana",
    lastName: "Ruiz",
    positionName: "Mesera",
    branchName: "Sucursal Centro",
    checkIn: "2026-10-04T13:00:00.000Z",
    status: "PRESENTE",
};

/** Entrada a las 8:30 a. m. */
const LUIS: EmpleadoAsistenciaHoy = {
    employeeId: 2,
    firstName: "Luis",
    lastName: "Gómez",
    positionName: "Chef",
    branchName: "Sucursal Norte",
    checkIn: "2026-10-04T13:30:00.000Z",
    status: "PRESENTE",
};

const MARTA: EmpleadoAsistenciaHoy = {
    employeeId: 3,
    firstName: "Marta",
    lastName: "Díaz",
    positionName: "Cajera",
    branchName: "Sucursal Centro",
    checkIn: null,
    status: "AUSENTE",
};

/** Consultada a las 10:00:00 a. m. */
const ASISTENCIA: AsistenciaHoyDatos = {
    fecha: "2026-10-04",
    actualizadoEn: "2026-10-04T15:00:00.000Z",
    totalEmpleados: 3,
    presentes: 2,
    ausentes: 1,
    data: [ANA, LUIS, MARTA],
};

/** Marta registra su entrada a las 10:00:20 a. m.; consultada a las 10:00:30. */
const ASISTENCIA_CON_MARTA: AsistenciaHoyDatos = {
    ...ASISTENCIA,
    actualizadoEn: "2026-10-04T15:00:30.000Z",
    presentes: 3,
    ausentes: 0,
    data: [
        ANA,
        LUIS,
        { ...MARTA, checkIn: "2026-10-04T15:00:20.000Z", status: "PRESENTE" },
    ],
};

const SIN_ENTRADAS: AsistenciaHoyDatos = {
    ...ASISTENCIA,
    presentes: 0,
    ausentes: 3,
    data: [
        { ...ANA, checkIn: null, status: "AUSENTE" },
        { ...LUIS, checkIn: null, status: "AUSENTE" },
        MARTA,
    ],
};

function renderVista() {
    const user = userEvent.setup();
    const utils = render(<AsistenciaHoy />);
    return { user, ...utils };
}

async function esperarTabla() {
    return screen.findByRole("table", {
        name: "Asistencia de los empleados durante el día actual",
    });
}

/** Filas de datos de la tabla, sin el encabezado. */
function filas() {
    return screen.getAllByRole("row").slice(1);
}

function textoDeFilas() {
    return filas().map((fila) =>
        within(fila)
            .getAllByRole("cell")
            .map((celda) => celda.textContent),
    );
}

function indicador(titulo: string) {
    return screen.getByRole("heading", { level: 3, name: titulo })
        .parentElement as HTMLElement;
}

/** Deja pasar el intervalo de actualización automática. */
async function esperarIntervalo() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(INTERVALO_ACTUALIZACION_MS);
    });
}

function cambiarVisibilidad(estado: DocumentVisibilityState) {
    Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => estado,
    });
    document.dispatchEvent(new Event("visibilitychange"));
}

beforeEach(() => {
    // 4 de octubre de 2026, 10:00 a. m. en Colombia. Solo se simulan el
    // reloj y los intervalos: las esperas de las pruebas usan tiempo real.
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
    vi.setSystemTime(new Date("2026-10-04T15:00:00.000Z"));

    consultarHoy.mockReset().mockResolvedValue(ASISTENCIA);
});

afterEach(() => {
    cambiarVisibilidad("visible");
    vi.useRealTimers();
});

describe("Asistencia hoy (HU05)", () => {
    describe("CA01 / CA10 – Información de la vista", () => {
        it("muestra la fecha actual", async () => {
            renderVista();
            await esperarTabla();

            expect(
                screen.getByText("domingo, 4 de octubre de 2026"),
            ).toBeInTheDocument();
        });

        it("muestra la cantidad de empleados presentes, ausentes y activos", async () => {
            renderVista();
            await esperarTabla();

            expect(indicador("Empleados presentes")).toHaveTextContent("2");
            expect(indicador("Empleados ausentes")).toHaveTextContent("1");
            expect(indicador("Empleados activos")).toHaveTextContent("3");
        });

        it("muestra la fecha y hora de la última actualización", async () => {
            renderVista();
            await esperarTabla();

            expect(screen.getByRole("status")).toHaveTextContent(
                "Última actualización: 04/10/2026, 10:00:00 a. m.",
            );
        });

        it("presenta la lista con sus columnas", async () => {
            renderVista();
            const tabla = await esperarTabla();

            expect(
                within(tabla)
                    .getAllByRole("columnheader")
                    .map((columna) => columna.textContent),
            ).toEqual([
                "Empleado",
                "Cargo",
                "Sucursal",
                "Hora de entrada",
                "Estado",
            ]);
        });

        it("lista a los empleados que registraron su entrada con nombre, cargo, sucursal, hora y estado", async () => {
            renderVista();
            await esperarTabla();

            expect(textoDeFilas()).toEqual([
                ["Ana Ruiz", "Mesera", "Sucursal Centro", "8:00 a. m.", "Presente"],
                ["Luis Gómez", "Chef", "Sucursal Norte", "8:30 a. m.", "Presente"],
            ]);
        });

        it("muestra un guion cuando el empleado no tiene cargo o sucursal", async () => {
            consultarHoy.mockResolvedValue({
                ...ASISTENCIA,
                data: [{ ...ANA, positionName: null, branchName: null }],
            });
            renderVista();
            await esperarTabla();

            expect(textoDeFilas()).toEqual([
                ["Ana Ruiz", "—", "—", "8:00 a. m.", "Presente"],
            ]);
        });
    });

    describe("CA02 / CA03 – Estado de asistencia", () => {
        it("no lista a los ausentes mientras la vista muestra solo a quienes ingresaron", async () => {
            renderVista();
            await esperarTabla();

            expect(
                screen.getByLabelText("Mostrar también los empleados ausentes"),
            ).not.toBeChecked();
            expect(
                screen.queryByRole("cell", { name: "Marta Díaz" }),
            ).not.toBeInTheDocument();
        });

        it("identifica como ausentes, sin hora de entrada, a quienes no han ingresado", async () => {
            const { user } = renderVista();
            await esperarTabla();

            await user.click(
                screen.getByLabelText("Mostrar también los empleados ausentes"),
            );

            expect(textoDeFilas()).toEqual([
                ["Ana Ruiz", "Mesera", "Sucursal Centro", "8:00 a. m.", "Presente"],
                ["Luis Gómez", "Chef", "Sucursal Norte", "8:30 a. m.", "Presente"],
                ["Marta Díaz", "Cajera", "Sucursal Centro", "—", "Ausente"],
            ]);
        });

        it("diferencia visualmente los estados Presente y Ausente", async () => {
            const { user } = renderVista();
            await esperarTabla();
            await user.click(
                screen.getByLabelText("Mostrar también los empleados ausentes"),
            );

            const presente = within(filas()[0]).getByText("Presente");
            const ausente = within(filas()[2]).getByText("Ausente");

            expect(presente).toHaveClass("bg-success-light", "text-success-dark");
            expect(ausente).toHaveClass("bg-error-light", "text-error-dark");
        });
    });

    describe("CA05 – Actualización automática", () => {
        it("vuelve a consultar al cumplirse el intervalo e incluye la nueva entrada", async () => {
            renderVista();
            await esperarTabla();
            expect(consultarHoy).toHaveBeenCalledTimes(1);

            consultarHoy.mockResolvedValue(ASISTENCIA_CON_MARTA);
            await esperarIntervalo();

            expect(
                await screen.findByRole("cell", { name: "Marta Díaz" }),
            ).toBeInTheDocument();
            expect(consultarHoy).toHaveBeenCalledTimes(2);
            expect(textoDeFilas()[2]).toEqual([
                "Marta Díaz",
                "Cajera",
                "Sucursal Centro",
                "10:00 a. m.",
                "Presente",
            ]);
            expect(indicador("Empleados presentes")).toHaveTextContent("3");
            expect(indicador("Empleados ausentes")).toHaveTextContent("0");
            expect(screen.getByRole("status")).toHaveTextContent(
                "Última actualización: 04/10/2026, 10:00:30 a. m.",
            );
        });

        it("sigue consultando en cada intervalo", async () => {
            renderVista();
            await esperarTabla();

            await esperarIntervalo();
            await esperarIntervalo();
            await esperarIntervalo();

            expect(consultarHoy).toHaveBeenCalledTimes(4);
        });

        it("informa cada cuánto se actualiza", async () => {
            renderVista();
            await esperarTabla();

            expect(
                screen.getByText(
                    "Se actualiza automáticamente cada 30 segundos.",
                ),
            ).toBeInTheDocument();
        });

        it("no consulta mientras la pestaña del navegador está oculta", async () => {
            renderVista();
            await esperarTabla();

            cambiarVisibilidad("hidden");
            await esperarIntervalo();
            await esperarIntervalo();

            expect(consultarHoy).toHaveBeenCalledTimes(1);
        });

        it("consulta de nuevo al volver a la pestaña del navegador", async () => {
            renderVista();
            await esperarTabla();
            cambiarVisibilidad("hidden");

            act(() => cambiarVisibilidad("visible"));

            await waitFor(() => expect(consultarHoy).toHaveBeenCalledTimes(2));
        });

        it("deja de consultar al salir de la vista", async () => {
            const { unmount } = renderVista();
            await esperarTabla();

            unmount();
            await esperarIntervalo();
            await esperarIntervalo();

            expect(consultarHoy).toHaveBeenCalledTimes(1);
        });
    });

    describe("CA06 / CA07 – Actualización manual e indicador", () => {
        it("consulta de nuevo y muestra la información actualizada", async () => {
            const { user } = renderVista();
            await esperarTabla();

            consultarHoy.mockResolvedValue(ASISTENCIA_CON_MARTA);
            await user.click(screen.getByRole("button", { name: "Actualizar" }));

            expect(
                await screen.findByRole("cell", { name: "Marta Díaz" }),
            ).toBeInTheDocument();
            expect(consultarHoy).toHaveBeenCalledTimes(2);
            expect(indicador("Empleados presentes")).toHaveTextContent("3");
            expect(screen.getByRole("status")).toHaveTextContent(
                "Última actualización: 04/10/2026, 10:00:30 a. m.",
            );
        });

        it("indica que la información fue actualizada correctamente", async () => {
            renderVista();
            await esperarTabla();

            expect(screen.getByRole("status")).toHaveTextContent(
                "Información actualizada",
            );
        });

        it("indica que está actualizando y evita consultas repetidas mientras termina", async () => {
            const { user } = renderVista();
            await esperarTabla();

            let terminar: (datos: AsistenciaHoyDatos) => void = () => {};
            consultarHoy.mockReturnValue(
                new Promise((resolve) => {
                    terminar = resolve;
                }),
            );
            await user.click(screen.getByRole("button", { name: "Actualizar" }));

            expect(screen.getByRole("status")).toHaveTextContent("Actualizando…");
            expect(
                screen.getByRole("button", { name: "Actualizar" }),
            ).toBeDisabled();
            // Los datos anteriores siguen visibles durante la consulta.
            expect(screen.getByRole("cell", { name: "Ana Ruiz" })).toBeInTheDocument();

            await act(async () => terminar(ASISTENCIA_CON_MARTA));

            expect(screen.getByRole("status")).toHaveTextContent(
                "Información actualizada",
            );
            expect(
                screen.getByRole("button", { name: "Actualizar" }),
            ).toBeEnabled();
        });

        it("conserva los datos y avisa cuando una actualización falla", async () => {
            const { user } = renderVista();
            await esperarTabla();

            consultarHoy.mockRejectedValue(
                new ApiError(0, "No fue posible conectar con el servidor."),
            );
            await user.click(screen.getByRole("button", { name: "Actualizar" }));

            await waitFor(() =>
                expect(screen.getByRole("status")).toHaveTextContent(
                    "No fue posible actualizar la información",
                ),
            );
            expect(screen.getByRole("status")).toHaveTextContent(
                "Última actualización: 04/10/2026, 10:00:00 a. m.",
            );
            expect(screen.getByRole("cell", { name: "Ana Ruiz" })).toBeInTheDocument();
            expect(indicador("Empleados presentes")).toHaveTextContent("2");
        });

        it("vuelve a indicar la información actualizada cuando la siguiente consulta funciona", async () => {
            const { user } = renderVista();
            await esperarTabla();

            consultarHoy.mockRejectedValueOnce(new ApiError(0, "Sin conexión."));
            await user.click(screen.getByRole("button", { name: "Actualizar" }));
            await waitFor(() =>
                expect(screen.getByRole("status")).toHaveTextContent(
                    "No fue posible actualizar la información",
                ),
            );

            await esperarIntervalo();

            await waitFor(() =>
                expect(screen.getByRole("status")).toHaveTextContent(
                    "Información actualizada",
                ),
            );
        });
    });

    describe("CA08 – Sin entradas en el día", () => {
        beforeEach(() => {
            consultarHoy.mockResolvedValue(SIN_ENTRADAS);
        });

        it("muestra cero presentes y el mensaje de que no hay entradas", async () => {
            renderVista();

            expect(
                await screen.findByText(
                    "No hay empleados con entrada registrada durante el día.",
                ),
            ).toBeInTheDocument();
            expect(indicador("Empleados presentes")).toHaveTextContent("0");
            expect(screen.queryByRole("table")).not.toBeInTheDocument();
        });

        it("permite ver a los empleados ausentes aunque nadie haya ingresado", async () => {
            const { user } = renderVista();
            await screen.findByText(
                "No hay empleados con entrada registrada durante el día.",
            );

            await user.click(
                screen.getByLabelText("Mostrar también los empleados ausentes"),
            );

            expect(
                textoDeFilas().map((celdas) => [celdas[0], celdas[3], celdas[4]]),
            ).toEqual([
                ["Ana Ruiz", "—", "Ausente"],
                ["Luis Gómez", "—", "Ausente"],
                ["Marta Díaz", "—", "Ausente"],
            ]);
        });
    });

    describe("Estados de carga y error", () => {
        it("indica que la asistencia se está cargando", () => {
            consultarHoy.mockReturnValue(new Promise(() => {}));
            renderVista();

            expect(
                screen.getByText("Cargando asistencia del día…"),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Actualizar" }),
            ).toBeDisabled();
        });

        it("muestra la fecha actual aunque la consulta falle", async () => {
            consultarHoy.mockRejectedValue(new ApiError(500, "Error interno"));
            renderVista();

            await screen.findByRole("alert");

            expect(
                screen.getByText("domingo, 4 de octubre de 2026"),
            ).toBeInTheDocument();
        });

        it("muestra el error de la primera consulta y permite reintentar", async () => {
            consultarHoy.mockRejectedValueOnce(
                new ApiError(
                    0,
                    "No fue posible conectar con el servidor. Intenta de nuevo.",
                ),
            );
            const { user } = renderVista();

            const alerta = await screen.findByRole("alert");
            expect(alerta).toHaveTextContent(
                "No fue posible conectar con el servidor",
            );

            await user.click(
                within(alerta).getByRole("button", { name: "Reintentar" }),
            );

            await esperarTabla();
            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
            expect(consultarHoy).toHaveBeenCalledTimes(2);
        });
    });
});
