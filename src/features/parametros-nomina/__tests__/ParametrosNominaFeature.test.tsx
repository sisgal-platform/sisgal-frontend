import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";
import { ToastProvider } from "@/toast/components/ToastProvider";

import { ParametrosNominaFeature } from "../index";
import type { WorkdayConfig } from "../interfaces/types";
import { workdayConfigService } from "../services/workdayConfigService";
import { workRatesService } from "../services/workRatesService";

const findAll = vi.spyOn(workdayConfigService, "findAll");
const register = vi.spyOn(workdayConfigService, "register");

const CURRENT: WorkdayConfig = {
    id: 2,
    maxWeekHours: 44,
    maxDayHours: 8,
    dayStart: "06:00",
    dayEnd: "21:00",
    nightStart: "21:00",
    nightEnd: "06:00",
    validFrom: "2026-07-01",
    validTo: null,
    status: "VIGENTE",
};

const HISTORICAL: WorkdayConfig = {
    ...CURRENT,
    id: 1,
    maxWeekHours: 46,
    validFrom: "2026-01-01",
    validTo: "2026-06-30",
    status: "HISTORICA",
};

/** Versión registrada en las pruebas: rige desde una fecha siempre futura. */
const REGISTERED: WorkdayConfig = {
    ...CURRENT,
    id: 3,
    maxWeekHours: 42,
    dayEnd: "19:00",
    nightStart: "19:00",
    validFrom: "2099-01-01",
    status: "PROGRAMADA",
};

function renderFeature() {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <ParametrosNominaFeature />
        </ToastProvider>,
    );
    return user;
}

async function waitForHistory() {
    return screen.findByRole("table", {
        name: "Historial de versiones de la jornada laboral",
    });
}

function row(validFrom: string) {
    const table = screen.getByRole("table", {
        name: "Historial de versiones de la jornada laboral",
    });
    const cell = within(table).getAllByRole("cell", { name: validFrom })[0];
    return cell.closest("tr") as HTMLElement;
}

async function openForm(user: ReturnType<typeof userEvent.setup>) {
    await waitForHistory();
    await user.click(screen.getByRole("button", { name: "Modificar jornada" }));
    return screen.getByRole("dialog", { name: "Modificar jornada laboral" });
}

beforeEach(() => {
    findAll.mockReset().mockResolvedValue([CURRENT, HISTORICAL]);
    register.mockReset().mockResolvedValue(REGISTERED);
});

describe("Parámetros de nómina: jornada laboral (HU45)", () => {
    describe("Consulta de parámetros", () => {
        it("organiza los parámetros por categorías", async () => {
            renderFeature();
            await waitForHistory();

            expect(
                screen.getByRole("tab", { name: "Jornada laboral" }),
            ).toHaveAttribute("aria-selected", "true");
            expect(
                screen.getByRole("tab", { name: "Horas y recargos" }),
            ).toBeEnabled();
            expect(
                screen.getByRole("tab", { name: "Deducciones" }),
            ).toBeDisabled();
        });

        it("muestra los recargos al elegir la categoría de horas y recargos", async () => {
            const findAllRates = vi
                .spyOn(workRatesService, "findAll")
                .mockResolvedValue([]);

            const user = renderFeature();
            await waitForHistory();

            await user.click(
                screen.getByRole("tab", { name: "Horas y recargos" }),
            );

            expect(
                await screen.findByRole("heading", {
                    level: 3,
                    name: "Horas y recargos",
                }),
            ).toBeInTheDocument();
            expect(findAllRates).toHaveBeenCalledTimes(1);
        });

        it("muestra el valor vigente de cada parámetro y su fecha de inicio", async () => {
            renderFeature();
            await waitForHistory();

            const card = screen.getByRole("region", {
                name: "Valores vigentes",
            });

            expect(within(card).getByText("44 horas")).toBeInTheDocument();
            expect(within(card).getByText("8 horas")).toBeInTheDocument();
            expect(
                within(card).getByText("6:00 a. m. – 9:00 p. m."),
            ).toBeInTheDocument();
            expect(
                within(card).getByText("9:00 p. m. – 6:00 a. m."),
            ).toBeInTheDocument();
            expect(
                within(card).getByText("Vigente desde el 01/07/2026."),
            ).toBeInTheDocument();
            expect(findAll).toHaveBeenCalledTimes(1);
        });

        it("informa cuando no hay una jornada laboral vigente", async () => {
            findAll.mockResolvedValue([]);

            renderFeature();

            expect(
                await screen.findByText(/No hay una jornada laboral vigente/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Aún no hay versiones registradas de la jornada laboral.",
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Registrar jornada" }),
            ).toBeInTheDocument();
        });

        it("muestra el error de la consulta y permite reintentar", async () => {
            findAll.mockRejectedValueOnce(
                new ApiError(
                    0,
                    "No fue posible conectar con el servidor. Intenta de nuevo.",
                ),
            );

            const user = renderFeature();

            expect(await screen.findByRole("alert")).toHaveTextContent(
                "No fue posible conectar con el servidor. Intenta de nuevo.",
            );
            expect(
                screen.queryByRole("button", { name: "Modificar jornada" }),
            ).not.toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: "Reintentar" }));

            await waitForHistory();
            expect(findAll).toHaveBeenCalledTimes(2);
        });
    });

    describe("Historial de configuración", () => {
        it("muestra las versiones anteriores con su período de vigencia", async () => {
            renderFeature();
            await waitForHistory();

            const historical = row("01/01/2026");

            expect(within(historical).getByText("30/06/2026")).toBeInTheDocument();
            expect(within(historical).getByText("46 horas")).toBeInTheDocument();
            expect(within(historical).getByText("Histórica")).toBeInTheDocument();
        });

        it("diferencia visualmente la versión vigente de las históricas", async () => {
            renderFeature();
            await waitForHistory();

            const current = row("01/07/2026");
            const historical = row("01/01/2026");

            expect(within(current).getByText("Vigente")).toBeInTheDocument();
            expect(within(current).getByText("Indefinida")).toBeInTheDocument();
            expect(current).not.toHaveClass("bg-surface-muted");
            expect(historical).toHaveClass("bg-surface-muted", "text-text-muted");
        });

        it("avisa cuando hay una versión programada que aún no rige", async () => {
            findAll.mockResolvedValue([REGISTERED, CURRENT, HISTORICAL]);

            renderFeature();
            await waitForHistory();

            expect(screen.getByRole("note")).toHaveTextContent(
                "Hay un cambio programado: los valores de la versión del 01/01/2099 empezarán a regir en esa fecha.",
            );
            expect(
                within(row("01/01/2099")).getByText("Programada"),
            ).toBeInTheDocument();
        });
    });

    describe("Modificación de la jornada laboral", () => {
        it("precarga el formulario con los valores de la última versión", async () => {
            const user = renderFeature();
            const dialog = await openForm(user);

            expect(
                within(dialog).getByLabelText(/Jornada máxima semanal/),
            ).toHaveValue(44);
            expect(
                within(dialog).getByLabelText(/Jornada máxima diaria/),
            ).toHaveValue(8);
            expect(
                within(dialog).getByLabelText(/Inicio de la jornada diurna/),
            ).toHaveValue("06:00");
            expect(
                within(dialog).getByLabelText(/Fin de la jornada nocturna/),
            ).toHaveValue("06:00");
            expect(within(dialog).getByLabelText(/Vigente desde/)).toHaveValue(
                "",
            );
        });

        it("pide confirmación antes de guardar y registra la nueva versión", async () => {
            const user = renderFeature();
            const dialog = await openForm(user);

            const maxWeekHours = within(dialog).getByLabelText(
                /Jornada máxima semanal/,
            );
            await user.clear(maxWeekHours);
            await user.type(maxWeekHours, "42");
            fireEvent.change(
                within(dialog).getByLabelText(/Fin de la jornada diurna/),
                { target: { value: "19:00" } },
            );
            fireEvent.change(within(dialog).getByLabelText(/Vigente desde/), {
                target: { value: "2099-01-01" },
            });
            await user.click(
                within(dialog).getByRole("button", { name: "Revisar cambios" }),
            );

            const confirmation = screen.getByRole("dialog", {
                name: "Confirmar cambios en la jornada laboral",
            });

            // La confirmación muestra desde cuándo aplica y el valor anterior y nuevo.
            expect(
                within(confirmation).getByText("01/01/2099"),
            ).toBeInTheDocument();
            expect(
                within(confirmation).getByText(/regirá hasta el 31\/12\/2098/),
            ).toBeInTheDocument();
            expect(
                within(confirmation).getByText("44 horas"),
            ).toBeInTheDocument();
            expect(
                within(confirmation).getByText("42 horas"),
            ).toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();

            await user.click(
                within(confirmation).getByRole("button", {
                    name: "Confirmar cambios",
                }),
            );

            await waitFor(() =>
                expect(register).toHaveBeenCalledWith({
                    maxWeekHours: 42,
                    maxDayHours: 8,
                    dayStart: "06:00",
                    dayEnd: "19:00",
                    nightStart: "19:00",
                    nightEnd: "06:00",
                    validFrom: "2099-01-01",
                }),
            );
            await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
            expect(await screen.findByTestId("toast")).toHaveTextContent(
                "La jornada laboral se guardó. Los nuevos valores rigen desde el 01/01/2099.",
            );
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        it("permite volver de la confirmación sin guardar ni perder los cambios", async () => {
            const user = renderFeature();
            const dialog = await openForm(user);

            const maxWeekHours = within(dialog).getByLabelText(
                /Jornada máxima semanal/,
            );
            await user.clear(maxWeekHours);
            await user.type(maxWeekHours, "42");
            fireEvent.change(within(dialog).getByLabelText(/Vigente desde/), {
                target: { value: "2099-01-01" },
            });
            await user.click(
                within(dialog).getByRole("button", { name: "Revisar cambios" }),
            );
            await user.click(screen.getByRole("button", { name: "Volver" }));

            const form = screen.getByRole("dialog", {
                name: "Modificar jornada laboral",
            });

            expect(
                within(form).getByLabelText(/Jornada máxima semanal/),
            ).toHaveValue(42);
            expect(within(form).getByLabelText(/Vigente desde/)).toHaveValue(
                "2099-01-01",
            );
            expect(register).not.toHaveBeenCalled();
        });

        it("cierra el formulario al cancelar sin registrar cambios", async () => {
            const user = renderFeature();
            const dialog = await openForm(user);

            await user.click(
                within(dialog).getByRole("button", { name: "Cancelar" }),
            );

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();
            expect(findAll).toHaveBeenCalledTimes(1);
        });
    });
});
