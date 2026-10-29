import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { employeesService } from "@/features/empleados/services/employeesService";
import type { Employee } from "@/features/empleados/interfaces/types";
import { ApiError } from "@/lib/apiError";

import {
    HUELLA_NO_REGISTRADA,
    LectorHuellaSimulado,
} from "../components/LectorHuellaSimulado";
import type { Marcacion } from "../interfaces/types";
import { asistenciaService } from "../services/asistenciaService";

const listarEmpleados = vi.spyOn(employeesService, "list");
const registrarMarcacion = vi.spyOn(
    asistenciaService,
    "registrarMarcacionSimulada",
);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

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
};

const LUIS: Employee = {
    ...ANA,
    id: 9,
    firstName: "Luis",
    lastName: "Gómez",
    document: "987654321",
    status: "INACTIVO",
};

/** Entrada de Ana a las 7:58 a. m. (hora de Colombia). */
const ENTRADA: Marcacion = {
    id: 10,
    tipo: "ENTRADA",
    metodo: "HUELLA",
    fechaHora: "2026-10-22T12:58:00.000Z",
    empleadoId: ANA.id,
    empleadoNombre: "Ana Ruiz",
    sucursalId: 1,
    sucursalNombre: "Sucursal Centro",
    registroAsistenciaId: 20,
    entrada: "2026-10-22T12:58:00.000Z",
    salida: null,
    minutosTrabajados: null,
};

/** Salida de Ana a las 5:00 p. m.: jornada de 9 h 02 min. */
const SALIDA: Marcacion = {
    ...ENTRADA,
    id: 11,
    tipo: "SALIDA",
    fechaHora: "2026-10-22T22:00:00.000Z",
    salida: "2026-10-22T22:00:00.000Z",
    minutosTrabajados: 542,
};

function renderLector() {
    const user = userEvent.setup();
    render(<LectorHuellaSimulado duracionLecturaMs={0} />);
    return { user };
}

const sensor = () =>
    screen.getByRole("button", { name: "Colocar el dedo en el lector" });

const pantalla = () => screen.getByRole("status");

async function elegirEmpleado(
    user: ReturnType<typeof userEvent.setup>,
    documento: string,
) {
    await screen.findByRole("option", { name: /Ana Ruiz/ });
    await user.selectOptions(screen.getByLabelText("Empleado"), documento);
}

beforeEach(() => {
    listarEmpleados.mockReset().mockResolvedValue([ANA, LUIS]);
    registrarMarcacion.mockReset().mockResolvedValue(ENTRADA);
});

describe("Lector de huella simulado", () => {
    it("invita a colocar el dedo y no lee hasta elegir quién marca", async () => {
        renderLector();

        expect(pantalla()).toHaveTextContent("Coloque su dedo en el lector");
        expect(sensor()).toBeDisabled();
        expect(
            await screen.findByRole("option", {
                name: "Luis Gómez — 987654321 (inactivo)",
            }),
        ).toBeInTheDocument();
    });

    it("registra la entrada del empleado y la muestra en la pantalla del lector", async () => {
        const { user } = renderLector();

        await elegirEmpleado(user, ANA.document);
        await user.click(sensor());

        expect(registrarMarcacion).toHaveBeenCalledWith({
            capturaExitosa: true,
            huella: ANA.document,
            idempotencyKey: expect.stringMatching(UUID),
        });
        await waitFor(() =>
            expect(pantalla()).toHaveTextContent("Entrada registrada"),
        );
        expect(pantalla()).toHaveTextContent("Ana Ruiz");
        expect(pantalla()).toHaveTextContent("7:58 a. m. · Sucursal Centro");
    });

    it("muestra la jornada completa al registrar la salida", async () => {
        registrarMarcacion.mockResolvedValue(SALIDA);
        const { user } = renderLector();

        await elegirEmpleado(user, ANA.document);
        await user.click(sensor());

        await waitFor(() =>
            expect(pantalla()).toHaveTextContent("Salida registrada"),
        );
        expect(pantalla()).toHaveTextContent(
            "Jornada: 7:58 a. m. – 5:00 p. m. · 9 h 02 min",
        );
    });

    it("bloquea el sensor mientras lee la huella", async () => {
        let responder: (marcacion: Marcacion) => void = () => {};
        registrarMarcacion.mockReturnValue(
            new Promise((resolve) => {
                responder = resolve;
            }),
        );
        const { user } = renderLector();

        await elegirEmpleado(user, ANA.document);
        await user.click(sensor());

        expect(pantalla()).toHaveTextContent("Leyendo huella…");
        expect(sensor()).toBeDisabled();

        responder(ENTRADA);
        await waitFor(() => expect(sensor()).toBeEnabled());
    });

    it("usa una clave de idempotencia nueva en cada lectura", async () => {
        const { user } = renderLector();

        await elegirEmpleado(user, ANA.document);
        await user.click(sensor());
        await waitFor(() => expect(sensor()).toBeEnabled());
        await user.click(sensor());

        await waitFor(() => expect(registrarMarcacion).toHaveBeenCalledTimes(2));
        const [primera, segunda] = registrarMarcacion.mock.calls.map(
            ([lectura]) => lectura.idempotencyKey,
        );
        expect(primera).not.toBe(segunda);
    });

    describe("rechazos", () => {
        it("simula a una persona sin huella registrada", async () => {
            registrarMarcacion.mockRejectedValue(
                new ApiError(404, "Huella no reconocida"),
            );
            const { user } = renderLector();

            await user.click(
                screen.getByLabelText("Una persona sin huella registrada"),
            );
            expect(screen.getByLabelText("Empleado")).toBeDisabled();
            await user.click(sensor());

            expect(registrarMarcacion).toHaveBeenCalledWith({
                capturaExitosa: true,
                huella: HUELLA_NO_REGISTRADA,
                idempotencyKey: expect.stringMatching(UUID),
            });
            await waitFor(() =>
                expect(pantalla()).toHaveTextContent("Huella no reconocida"),
            );
        });

        it("simula una falla del lector sin enviar huella", async () => {
            registrarMarcacion.mockRejectedValue(
                new ApiError(503, "Error en lectura biométrica"),
            );
            const { user } = renderLector();

            await elegirEmpleado(user, ANA.document);
            await user.click(
                screen.getByLabelText("Simular una falla del lector"),
            );
            await user.click(sensor());

            expect(registrarMarcacion).toHaveBeenCalledWith({
                capturaExitosa: false,
                idempotencyKey: expect.stringMatching(UUID),
            });
            await waitFor(() =>
                expect(pantalla()).toHaveTextContent(
                    "Error en lectura biométrica",
                ),
            );
        });

        it("muestra el rechazo de un registro duplicado", async () => {
            registrarMarcacion.mockRejectedValue(
                new ApiError(409, "Registro duplicado no permitido"),
            );
            const { user } = renderLector();

            await elegirEmpleado(user, ANA.document);
            await user.click(sensor());

            await waitFor(() =>
                expect(pantalla()).toHaveTextContent(
                    "Registro duplicado no permitido",
                ),
            );
        });

        it("muestra el rechazo de un empleado inactivo", async () => {
            registrarMarcacion.mockRejectedValue(
                new ApiError(400, "El empleado no se encuentra activo."),
            );
            const { user } = renderLector();

            await elegirEmpleado(user, LUIS.document);
            await user.click(sensor());

            await waitFor(() =>
                expect(pantalla()).toHaveTextContent(
                    "El empleado no se encuentra activo.",
                ),
            );
        });
    });

    it("muestra un mensaje en español cuando el servidor falla al guardar", async () => {
        registrarMarcacion.mockRejectedValue(
            new ApiError(500, "Internal server error"),
        );
        const { user } = renderLector();

        await elegirEmpleado(user, ANA.document);
        await user.click(sensor());

        await waitFor(() =>
            expect(pantalla()).toHaveTextContent(
                "No fue posible registrar la marcación. Intenta de nuevo.",
            ),
        );
        expect(pantalla()).not.toHaveTextContent("Internal server error");
    });

    it("avisa si no pudo cargar los empleados", async () => {
        listarEmpleados.mockRejectedValue(new Error("fallo"));
        renderLector();

        expect(
            await screen.findByText("No fue posible cargar los empleados."),
        ).toBeInTheDocument();
    });
});
