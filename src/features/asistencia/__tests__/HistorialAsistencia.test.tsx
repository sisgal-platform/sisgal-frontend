import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Employee } from "@/features/empleados/interfaces/types";
import { employeesService } from "@/features/empleados/services/employeesService";
import { ApiError } from "@/lib/apiError";

import { HistorialAsistencia } from "../components/HistorialAsistencia";
import type {
    HistorialAsistencia as HistorialDatos,
    RegistroAsistencia,
} from "../interfaces/types";
import { asistenciaService } from "../services/asistenciaService";

const consultarHistorial = vi.spyOn(asistenciaService, "consultarHistorial");
const listarEmpleados = vi.spyOn(employeesService, "list");

const ANA: Employee = {
    id: 6,
    firstName: "Ana",
    lastName: "Ruiz",
    documentType: "CC",
    document: "1234567890",
    phone: "3001234567",
    salaryBase: 1800000,
    hireDate: "2025-08-01",
    position: "Mesera",
    status: "ACTIVO",
    branchId: 1,
    positionId: 2,
    branchName: "Sucursal Centro",
    positionName: "Mesera",
    workdayConfigId: null,
};

const LUIS: Employee = {
    ...ANA,
    id: 9,
    firstName: "Luis",
    lastName: "Gómez",
    document: "987654321",
    status: "INACTIVO",
};

/** Entrada 8:00 a. m. y salida 4:30 p. m. (hora de Colombia). */
const REGISTRO_COMPLETO: RegistroAsistencia = {
    id: 1,
    employee: {
        id: ANA.id,
        firstName: ANA.firstName,
        lastName: ANA.lastName,
        documentType: ANA.documentType,
        document: ANA.document,
    },
    branchId: 1,
    branchName: "Sucursal Centro",
    checkIn: "2026-09-15T13:00:00.000Z",
    checkOut: "2026-09-15T21:30:00.000Z",
    workedMinutes: 510,
    status: "COMPLETO",
};

const REGISTRO_INCOMPLETO: RegistroAsistencia = {
    ...REGISTRO_COMPLETO,
    id: 2,
    checkIn: "2026-09-16T13:05:00.000Z",
    checkOut: null,
    workedMinutes: null,
    status: "INCOMPLETO",
};

function crearHistorial(
    data: RegistroAsistencia[],
    paginacion: Partial<HistorialDatos> = {},
): HistorialDatos {
    return {
        data,
        total: data.length,
        pagina: 1,
        porPagina: 10,
        totalPaginas: data.length > 0 ? 1 : 0,
        ...paginacion,
    };
}

const CONSULTA_INICIAL = {
    empleadoId: "",
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
    pagina: 1,
    porPagina: 10,
};

function renderFeature() {
    const user = userEvent.setup();
    render(<HistorialAsistencia />);
    return user;
}

async function esperarTabla() {
    return screen.findByRole("table", {
        name: "Historial de asistencia en orden cronológico",
    });
}

/** Filas de datos de la tabla, sin el encabezado. */
function filas() {
    return screen.getAllByRole("row").slice(1);
}

function escribirFecha(etiqueta: string, valor: string) {
    fireEvent.change(screen.getByLabelText(etiqueta), {
        target: { value: valor },
    });
}

function buscar(user: ReturnType<typeof userEvent.setup>) {
    return user.click(screen.getByRole("button", { name: "Buscar" }));
}

beforeEach(() => {
    // 4 de octubre de 2026, 10:00 a. m. en Colombia.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-04T15:00:00.000Z"));

    consultarHistorial
        .mockReset()
        .mockResolvedValue(
            crearHistorial([REGISTRO_COMPLETO, REGISTRO_INCOMPLETO]),
        );
    listarEmpleados.mockReset().mockResolvedValue([LUIS, ANA]);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("Historial de asistencia (HU04)", () => {
    describe("CA12 – Filtros de búsqueda", () => {
        it("muestra los filtros disponibles al cargar la vista", async () => {
            renderFeature();
            await esperarTabla();

            const filtros = screen.getByRole("form", {
                name: "Filtros del historial",
            });
            const empleado = within(filtros).getByLabelText("Empleado");

            expect(
                within(empleado)
                    .getAllByRole("option")
                    .map((opcion) => opcion.textContent),
            ).toEqual([
                "Todos los empleados",
                "Ana Ruiz — 1234567890",
                "Luis Gómez — 987654321",
            ]);
            expect(
                within(within(filtros).getByLabelText("Estado"))
                    .getAllByRole("option")
                    .map((opcion) => opcion.textContent),
            ).toEqual(["Todos los estados", "Completo", "Incompleto"]);
            expect(
                within(filtros).getByLabelText("Fecha inicial"),
            ).toHaveAttribute("type", "date");
            expect(
                within(filtros).getByLabelText("Fecha final"),
            ).toHaveAttribute("type", "date");
            expect(
                within(filtros).getByRole("button", { name: "Buscar" }),
            ).toBeInTheDocument();
            expect(
                within(filtros).getByRole("button", {
                    name: "Limpiar filtros",
                }),
            ).toBeInTheDocument();
        });

        it("limita las fechas entre el 1 de enero de 1900 y la fecha actual", async () => {
            renderFeature();
            await esperarTabla();

            for (const etiqueta of ["Fecha inicial", "Fecha final"]) {
                const campo = screen.getByLabelText(etiqueta);
                expect(campo).toHaveAttribute("min", "1900-01-01");
                expect(campo).toHaveAttribute("max", "2026-10-04");
            }
        });

        it("consulta el historial sin filtros al cargar", async () => {
            renderFeature();
            await esperarTabla();

            expect(consultarHistorial).toHaveBeenCalledTimes(1);
            expect(consultarHistorial).toHaveBeenCalledWith(CONSULTA_INICIAL);
        });

        it("permite buscar aunque no se puedan cargar los empleados", async () => {
            listarEmpleados.mockRejectedValue(new Error("fallo"));
            const user = renderFeature();
            await esperarTabla();

            expect(
                await screen.findByText("No fue posible cargar los empleados."),
            ).toBeInTheDocument();

            escribirFecha("Fecha inicial", "2026-09-01");
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    fechaDesde: "2026-09-01",
                }),
            );
        });
    });

    describe("CA01 / CA02 / CA04 – Filtrar por empleado y rango de fechas", () => {
        it("busca el historial del empleado seleccionado", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.selectOptions(screen.getByLabelText("Empleado"), "6");
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    empleadoId: "6",
                }),
            );
        });

        it("busca el historial por rango de fechas", async () => {
            const user = renderFeature();
            await esperarTabla();

            escribirFecha("Fecha inicial", "2026-09-01");
            escribirFecha("Fecha final", "2026-09-30");
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    fechaDesde: "2026-09-01",
                    fechaHasta: "2026-09-30",
                }),
            );
        });

        it("combina el empleado y el rango de fechas", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.selectOptions(screen.getByLabelText("Empleado"), "6");
            escribirFecha("Fecha inicial", "2026-09-15");
            escribirFecha("Fecha final", "2026-09-15");
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    empleadoId: "6",
                    fechaDesde: "2026-09-15",
                    fechaHasta: "2026-09-15",
                }),
            );
        });

        it.each([
            ["Incompleto", "INCOMPLETO"],
            ["Completo", "COMPLETO"],
        ])("busca los registros en estado %s", async (etiqueta, estado) => {
            const user = renderFeature();
            await esperarTabla();

            await user.selectOptions(screen.getByLabelText("Estado"), etiqueta);
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    estado,
                }),
            );
        });

        it("combina el empleado, el rango de fechas y el estado", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.selectOptions(screen.getByLabelText("Empleado"), "6");
            await user.selectOptions(
                screen.getByLabelText("Estado"),
                "Incompleto",
            );
            escribirFecha("Fecha inicial", "2026-09-01");
            escribirFecha("Fecha final", "2026-09-30");
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    empleadoId: "6",
                    fechaDesde: "2026-09-01",
                    fechaHasta: "2026-09-30",
                    estado: "INCOMPLETO",
                    pagina: 1,
                    porPagina: 10,
                }),
            );
        });

        it("no consulta hasta que el administrador presiona Buscar", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.selectOptions(screen.getByLabelText("Empleado"), "6");
            escribirFecha("Fecha inicial", "2026-09-01");

            expect(consultarHistorial).toHaveBeenCalledTimes(1);
        });

        it("limpia los filtros y vuelve a consultar todo el historial", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.selectOptions(screen.getByLabelText("Empleado"), "6");
            await user.selectOptions(
                screen.getByLabelText("Estado"),
                "Incompleto",
            );
            escribirFecha("Fecha inicial", "2026-09-01");
            await buscar(user);
            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenCalledTimes(2),
            );

            await user.click(
                screen.getByRole("button", { name: "Limpiar filtros" }),
            );

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith(
                    CONSULTA_INICIAL,
                ),
            );
            expect(screen.getByLabelText("Empleado")).toHaveValue("");
            expect(screen.getByLabelText("Estado")).toHaveValue("");
            expect(screen.getByLabelText("Fecha inicial")).toHaveValue("");
        });
    });

    describe("CA02 / CA03 – Validación del rango de fechas", () => {
        it("rechaza la búsqueda cuando la fecha inicial es posterior a la final", async () => {
            const user = renderFeature();
            await esperarTabla();

            escribirFecha("Fecha inicial", "2026-09-30");
            escribirFecha("Fecha final", "2026-09-01");
            await buscar(user);

            expect(screen.getByRole("alert")).toHaveTextContent(
                "El rango de fechas seleccionado no es válido: la fecha inicial no puede ser posterior a la fecha final.",
            );
            expect(screen.getByLabelText("Fecha inicial")).toHaveAttribute(
                "aria-invalid",
                "true",
            );
            expect(screen.getByLabelText("Fecha final")).toHaveAccessibleDescription(
                /El rango de fechas seleccionado no es válido/,
            );
            expect(consultarHistorial).toHaveBeenCalledTimes(1);
        });

        it("rechaza una fecha inicial anterior al 1 de enero de 1900", async () => {
            const user = renderFeature();
            await esperarTabla();

            escribirFecha("Fecha inicial", "1899-12-31");
            await buscar(user);

            expect(screen.getByRole("alert")).toHaveTextContent(
                "La fecha inicial no puede ser anterior al 1 de enero de 1900.",
            );
            expect(consultarHistorial).toHaveBeenCalledTimes(1);
        });

        it("rechaza una fecha final posterior a la fecha actual", async () => {
            const user = renderFeature();
            await esperarTabla();

            escribirFecha("Fecha final", "2026-10-05");
            await buscar(user);

            expect(screen.getByRole("alert")).toHaveTextContent(
                "La fecha final no puede ser posterior a la fecha actual.",
            );
            expect(consultarHistorial).toHaveBeenCalledTimes(1);
        });

        it("retira el mensaje cuando el administrador corrige el rango", async () => {
            const user = renderFeature();
            await esperarTabla();

            escribirFecha("Fecha inicial", "2026-09-30");
            escribirFecha("Fecha final", "2026-09-01");
            await buscar(user);
            expect(screen.getByRole("alert")).toBeInTheDocument();

            escribirFecha("Fecha final", "2026-09-30");

            expect(screen.queryByRole("alert")).not.toBeInTheDocument();

            await buscar(user);
            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    fechaDesde: "2026-09-30",
                    fechaHasta: "2026-09-30",
                }),
            );
        });

        it("muestra el rechazo del backend cuando el rango no es válido", async () => {
            consultarHistorial.mockRejectedValue(
                new ApiError(
                    400,
                    "La fecha final no puede ser posterior a la fecha actual.",
                ),
            );
            renderFeature();

            expect(await screen.findByRole("alert")).toHaveTextContent(
                "La fecha final no puede ser posterior a la fecha actual.",
            );
        });
    });

    describe("CA05 / CA06 / CA13 – Información de las marcaciones", () => {
        it("presenta el historial en una tabla con sus columnas", async () => {
            renderFeature();
            const tabla = await esperarTabla();

            expect(
                within(tabla)
                    .getAllByRole("columnheader")
                    .map((columna) => columna.textContent),
            ).toEqual([
                "Fecha",
                "Empleado",
                "Documento",
                "Sucursal",
                "Hora de entrada",
                "Hora de salida",
                "Horas trabajadas",
                "Estado",
            ]);
        });

        it("muestra la fecha, la entrada, la salida y las horas trabajadas", async () => {
            renderFeature();
            await esperarTabla();

            const [fila] = filas();

            expect(
                within(fila)
                    .getAllByRole("cell")
                    .map((celda) => celda.textContent),
            ).toEqual([
                "15/09/2026",
                "Ana Ruiz",
                "CC 1234567890",
                "Sucursal Centro",
                "8:00 a. m.",
                "4:30 p. m.",
                "8 h 30 min",
                "Completo",
            ]);
        });

        it("indica la fecha de salida cuando el turno termina al día siguiente", async () => {
            consultarHistorial.mockResolvedValue(
                crearHistorial([
                    {
                        ...REGISTRO_COMPLETO,
                        // De 6:00 p. m. a 2:00 a. m. del día siguiente.
                        checkIn: "2026-09-15T23:00:00.000Z",
                        checkOut: "2026-09-16T07:00:00.000Z",
                        workedMinutes: 480,
                    },
                ]),
            );
            renderFeature();
            await esperarTabla();

            const celdas = within(filas()[0]).getAllByRole("cell");

            expect(celdas[0]).toHaveTextContent("15/09/2026");
            expect(celdas[5]).toHaveTextContent("2:00 a. m.");
            expect(celdas[5]).toHaveTextContent("16/09/2026");
            expect(celdas[6]).toHaveTextContent("8 h 00 min");
        });

        it("muestra un guion cuando el registro no tiene sucursal", async () => {
            consultarHistorial.mockResolvedValue(
                crearHistorial([
                    { ...REGISTRO_COMPLETO, branchId: null, branchName: null },
                ]),
            );
            renderFeature();
            await esperarTabla();

            expect(within(filas()[0]).getAllByRole("cell")[3]).toHaveTextContent(
                "—",
            );
        });
    });

    describe("CA07 – Registros incompletos", () => {
        it("identifica el registro sin salida como incompleto y no muestra horas", async () => {
            renderFeature();
            await esperarTabla();

            const celdas = within(filas()[1]).getAllByRole("cell");

            expect(celdas[4]).toHaveTextContent("8:05 a. m.");
            expect(celdas[5]).toHaveTextContent("Sin salida");
            expect(celdas[6]).toHaveTextContent("—");
            expect(celdas[7]).toHaveTextContent("Incompleto");
        });

        it("diferencia visualmente el registro incompleto del completo", async () => {
            renderFeature();
            await esperarTabla();

            const [completo, incompleto] = filas();

            expect(incompleto).toHaveClass("bg-warning-light/40");
            expect(completo).not.toHaveClass("bg-warning-light/40");
        });
    });

    describe("CA08 – Orden cronológico", () => {
        it("conserva el orden cronológico que entrega el backend", async () => {
            consultarHistorial.mockResolvedValue(
                crearHistorial([
                    { ...REGISTRO_COMPLETO, id: 1 },
                    {
                        ...REGISTRO_COMPLETO,
                        id: 2,
                        checkIn: "2026-09-16T13:00:00.000Z",
                        checkOut: "2026-09-16T21:00:00.000Z",
                    },
                    {
                        ...REGISTRO_COMPLETO,
                        id: 3,
                        checkIn: "2026-09-17T13:00:00.000Z",
                        checkOut: "2026-09-17T21:00:00.000Z",
                    },
                ]),
            );
            renderFeature();
            await esperarTabla();

            expect(
                filas().map(
                    (fila) => within(fila).getAllByRole("cell")[0].textContent,
                ),
            ).toEqual(["15/09/2026", "16/09/2026", "17/09/2026"]);
        });
    });

    describe("CA09 – Paginación", () => {
        beforeEach(() => {
            consultarHistorial.mockResolvedValue(
                crearHistorial([REGISTRO_COMPLETO], {
                    total: 57,
                    totalPaginas: 6,
                }),
            );
        });

        function paginacion() {
            return screen.getByRole("navigation", {
                name: "Paginación del historial",
            });
        }

        it("indica la página actual y el total de registros", async () => {
            renderFeature();
            await esperarTabla();

            expect(
                within(paginacion()).getByText("Página 1 de 6"),
            ).toHaveAttribute("aria-current", "page");
            expect(
                within(paginacion()).getByText("Mostrando 1–10 de 57 registros"),
            ).toBeInTheDocument();
        });

        it("permite seleccionar 10, 25 o 50 resultados por página", async () => {
            const user = renderFeature();
            await esperarTabla();

            const selector = within(paginacion()).getByLabelText(
                "Resultados por página",
            );

            expect(
                within(selector)
                    .getAllByRole("option")
                    .map((opcion) => opcion.textContent),
            ).toEqual(["10", "25", "50"]);
            expect(selector).toHaveValue("10");

            await user.selectOptions(selector, "25");

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    porPagina: 25,
                }),
            );
        });

        it("navega a la página siguiente y a la anterior", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.click(
                within(paginacion()).getByRole("button", { name: "Siguiente" }),
            );

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    pagina: 2,
                }),
            );
            expect(
                within(paginacion()).getByText("Página 2 de 6"),
            ).toBeInTheDocument();
            expect(
                within(paginacion()).getByText(
                    "Mostrando 11–20 de 57 registros",
                ),
            ).toBeInTheDocument();

            await user.click(
                within(paginacion()).getByRole("button", { name: "Anterior" }),
            );

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith(
                    CONSULTA_INICIAL,
                ),
            );
        });

        it("no permite retroceder desde la primera página", async () => {
            renderFeature();
            await esperarTabla();

            expect(
                within(paginacion()).getByRole("button", { name: "Anterior" }),
            ).toBeDisabled();
            expect(
                within(paginacion()).getByRole("button", { name: "Siguiente" }),
            ).toBeEnabled();
        });

        it("no permite avanzar desde la última página", async () => {
            consultarHistorial.mockResolvedValue(
                crearHistorial([REGISTRO_COMPLETO], {
                    total: 12,
                    totalPaginas: 2,
                }),
            );
            const user = renderFeature();
            await esperarTabla();

            await user.click(
                within(paginacion()).getByRole("button", { name: "Siguiente" }),
            );

            await waitFor(() =>
                expect(
                    within(paginacion()).getByRole("button", {
                        name: "Siguiente",
                    }),
                ).toBeDisabled(),
            );
            expect(
                within(paginacion()).getByText(
                    "Mostrando 11–12 de 12 registros",
                ),
            ).toBeInTheDocument();
        });

        it("vuelve a la primera página al cambiar los resultados por página", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.click(
                within(paginacion()).getByRole("button", { name: "Siguiente" }),
            );
            await user.selectOptions(
                within(paginacion()).getByLabelText("Resultados por página"),
                "50",
            );

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    pagina: 1,
                    porPagina: 50,
                }),
            );
        });

        it("vuelve a la primera página al aplicar un filtro nuevo", async () => {
            const user = renderFeature();
            await esperarTabla();

            await user.click(
                within(paginacion()).getByRole("button", { name: "Siguiente" }),
            );
            await user.selectOptions(screen.getByLabelText("Empleado"), "6");
            await buscar(user);

            await waitFor(() =>
                expect(consultarHistorial).toHaveBeenLastCalledWith({
                    ...CONSULTA_INICIAL,
                    empleadoId: "6",
                    pagina: 1,
                }),
            );
        });
    });

    describe("CA10 – Sin resultados", () => {
        it('muestra "No se encontraron resultados." y ningún registro', async () => {
            consultarHistorial.mockResolvedValue(crearHistorial([]));
            renderFeature();

            expect(
                await screen.findByText("No se encontraron resultados."),
            ).toBeInTheDocument();
            expect(screen.queryByRole("table")).not.toBeInTheDocument();
            expect(
                screen.queryByRole("navigation", {
                    name: "Paginación del historial",
                }),
            ).not.toBeInTheDocument();
        });
    });

    describe("Estados de carga y error", () => {
        it("indica que el historial se está cargando", () => {
            consultarHistorial.mockReturnValue(new Promise(() => {}));
            renderFeature();

            expect(screen.getByText("Cargando historial…")).toBeInTheDocument();
        });

        it("muestra el error de la consulta y permite reintentar", async () => {
            consultarHistorial.mockRejectedValueOnce(
                new ApiError(
                    0,
                    "No fue posible conectar con el servidor. Intenta de nuevo.",
                ),
            );
            const user = renderFeature();

            const alerta = await screen.findByRole("alert");
            expect(alerta).toHaveTextContent(
                "No fue posible conectar con el servidor",
            );

            await user.click(
                within(alerta).getByRole("button", { name: "Reintentar" }),
            );

            await esperarTabla();
            expect(consultarHistorial).toHaveBeenCalledTimes(2);
        });
    });
});
