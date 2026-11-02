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

import { WorkRatesSection } from "../components/WorkRatesSection";
import type { WorkRate } from "../interfaces/types";
import { workRatesService } from "../services/workRatesService";

const findAll = vi.spyOn(workRatesService, "findAll");
const register = vi.spyOn(workRatesService, "register");

function rate(
    overrides: Partial<WorkRate> & Pick<WorkRate, "id" | "type">,
): WorkRate {
    return {
        multiplier: 1.25,
        validFrom: "2026-01-01",
        validTo: null,
        status: "VIGENTE",
        ...overrides,
    };
}

const EXTRA_DIURNA_HISTORICAL = rate({
    id: 9,
    type: "EXTRA_DIURNA",
    multiplier: 1.2,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    status: "HISTORICA",
});

/** Por tipo de hora y, dentro de cada tipo, de la versión más reciente a la más antigua. */
const RATES: WorkRate[] = [
    rate({ id: 1, type: "ORDINARIA_DIURNA", multiplier: 1 }),
    rate({ id: 2, type: "ORDINARIA_NOCTURNA", multiplier: 1.35 }),
    rate({ id: 3, type: "EXTRA_DIURNA", multiplier: 1.25 }),
    EXTRA_DIURNA_HISTORICAL,
    rate({ id: 4, type: "EXTRA_NOCTURNA", multiplier: 1.75 }),
    rate({ id: 5, type: "DOMINICAL_DIURNA", multiplier: 1.75 }),
    rate({ id: 6, type: "DOMINICAL_NOCTURNA", multiplier: 2.1 }),
    rate({ id: 7, type: "EXTRA_DOMINICAL_DIURNA", multiplier: 2 }),
    rate({ id: 8, type: "EXTRA_DOMINICAL_NOCTURNA", multiplier: 2.5 }),
];

/** Versión registrada en las pruebas: rige desde una fecha siempre futura. */
const REGISTERED = rate({
    id: 20,
    type: "EXTRA_DIURNA",
    multiplier: 1.3,
    validFrom: "2099-01-01",
    status: "PROGRAMADA",
});

function renderSection() {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <WorkRatesSection />
        </ToastProvider>,
    );
    return user;
}

async function waitForHistory() {
    return screen.findByRole("table", {
        name: "Historial de versiones de los recargos laborales",
    });
}

function currentRow(label: string) {
    const card = screen.getByRole("region", { name: "Valores vigentes" });
    return within(card)
        .getByRole("rowheader", { name: label })
        .closest("tr") as HTMLElement;
}

beforeEach(() => {
    findAll.mockReset().mockResolvedValue(RATES);
    register.mockReset().mockResolvedValue([REGISTERED]);
});

describe("Parámetros de nómina: horas y recargos (HU39)", () => {
    describe("Consulta de parámetros", () => {
        it("muestra el recargo vigente de cada tipo de hora y su fecha de inicio", async () => {
            renderSection();
            await waitForHistory();

            const extraDiurna = currentRow("Extra diurna");

            expect(within(extraDiurna).getByText("25 %")).toBeInTheDocument();
            expect(within(extraDiurna).getByText("× 1,25")).toBeInTheDocument();
            expect(
                within(extraDiurna).getByText("Desde el 01/01/2026"),
            ).toBeInTheDocument();
            expect(
                within(currentRow("Ordinaria diurna")).getByText("0 %"),
            ).toBeInTheDocument();
            expect(
                within(currentRow("Dominical o festiva nocturna")).getByText(
                    "110 %",
                ),
            ).toBeInTheDocument();
            expect(
                within(
                    currentRow("Extra dominical o festiva nocturna"),
                ).getByText("150 %"),
            ).toBeInTheDocument();
            expect(findAll).toHaveBeenCalledTimes(1);
        });

        it("agrupa los tipos de hora en ordinarias y extra, y dominicales y festivos", async () => {
            renderSection();
            await waitForHistory();

            const ordinarias = screen.getByRole("table", {
                name: "Horas ordinarias y extra",
            });
            const dominicales = screen.getByRole("table", {
                name: "Dominicales y festivos",
            });

            expect(within(ordinarias).getAllByRole("rowheader")).toHaveLength(4);
            expect(within(dominicales).getAllByRole("rowheader")).toHaveLength(
                4,
            );
        });

        it("señala los tipos de hora que no tienen un recargo vigente", async () => {
            findAll.mockResolvedValue(
                RATES.filter((item) => item.type !== "EXTRA_NOCTURNA"),
            );

            renderSection();
            await waitForHistory();

            expect(
                within(currentRow("Extra nocturna")).getByText(
                    "Sin valor vigente",
                ),
            ).toBeInTheDocument();
        });

        it("informa cuando no hay recargos registrados", async () => {
            findAll.mockResolvedValue([]);

            renderSection();

            expect(
                await screen.findByText(/No hay recargos vigentes/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Aún no hay versiones registradas de los recargos.",
                ),
            ).toBeInTheDocument();
        });

        it("muestra el error de la consulta y permite reintentar", async () => {
            findAll.mockRejectedValueOnce(
                new ApiError(
                    0,
                    "No fue posible conectar con el servidor. Intenta de nuevo.",
                ),
            );

            const user = renderSection();

            expect(await screen.findByRole("alert")).toHaveTextContent(
                "No fue posible conectar con el servidor. Intenta de nuevo.",
            );
            expect(
                screen.queryByRole("button", { name: "Modificar recargos" }),
            ).not.toBeInTheDocument();

            await user.click(screen.getByRole("button", { name: "Reintentar" }));

            await waitForHistory();
            expect(findAll).toHaveBeenCalledTimes(2);
        });
    });

    describe("Historial de configuración", () => {
        it("muestra las versiones anteriores con su período de vigencia, atenuadas frente a las vigentes", async () => {
            renderSection();
            const table = await waitForHistory();

            const historical = within(table)
                .getByRole("cell", { name: "20 %" })
                .closest("tr") as HTMLElement;
            const current = within(table)
                .getByRole("cell", { name: "25 %" })
                .closest("tr") as HTMLElement;

            expect(within(historical).getByText("Extra diurna")).toBeInTheDocument();
            expect(within(historical).getByText("01/01/2025")).toBeInTheDocument();
            expect(within(historical).getByText("31/12/2025")).toBeInTheDocument();
            expect(within(historical).getByText("Histórica")).toBeInTheDocument();
            expect(historical).toHaveClass("bg-surface-muted", "text-text-muted");

            expect(within(current).getByText("Vigente")).toBeInTheDocument();
            expect(within(current).getByText("Indefinida")).toBeInTheDocument();
            expect(current).not.toHaveClass("bg-surface-muted");
        });

        it("filtra el historial por tipo de hora", async () => {
            const user = renderSection();
            const table = await waitForHistory();

            // Encabezado más las nueve versiones.
            expect(within(table).getAllByRole("row")).toHaveLength(10);

            await user.selectOptions(
                screen.getByLabelText("Tipo de hora"),
                "EXTRA_DIURNA",
            );

            expect(within(table).getAllByRole("row")).toHaveLength(3);
        });

        it("informa cuando el tipo de hora filtrado no tiene versiones", async () => {
            findAll.mockResolvedValue(
                RATES.filter((item) => item.type !== "EXTRA_NOCTURNA"),
            );

            const user = renderSection();
            await waitForHistory();

            await user.selectOptions(
                screen.getByLabelText("Tipo de hora"),
                "EXTRA_NOCTURNA",
            );

            expect(
                screen.getByText(
                    "No hay versiones registradas para este tipo de hora.",
                ),
            ).toBeInTheDocument();
        });

        it("avisa cuando hay recargos programados que aún no rigen", async () => {
            findAll.mockResolvedValue([REGISTERED, ...RATES]);

            renderSection();
            await waitForHistory();

            expect(screen.getByRole("note")).toHaveTextContent(
                "Hay cambios programados: los recargos registrados para el 01/01/2099 empezarán a regir en esa fecha.",
            );
            // El valor vigente sigue siendo el anterior hasta esa fecha.
            expect(
                within(currentRow("Extra diurna")).getByText("25 %"),
            ).toBeInTheDocument();
        });
    });

    describe("Modificación de los recargos", () => {
        it("pide confirmación antes de guardar y registra solo los recargos modificados", async () => {
            const user = renderSection();
            await waitForHistory();

            await user.click(
                screen.getByRole("button", { name: "Modificar recargos" }),
            );
            const dialog = screen.getByRole("dialog", {
                name: "Modificar recargos",
            });
            const extraDiurna = within(dialog).getByLabelText(
                /^Extra diurna \(%\)/,
            );

            expect(extraDiurna).toHaveValue(25);

            await user.clear(extraDiurna);
            await user.type(extraDiurna, "30");
            fireEvent.change(within(dialog).getByLabelText(/Vigente desde/), {
                target: { value: "2099-01-01" },
            });
            await user.click(
                within(dialog).getByRole("button", { name: "Revisar cambios" }),
            );

            const confirmation = screen.getByRole("dialog", {
                name: "Confirmar cambios en los recargos",
            });

            // La confirmación muestra desde cuándo aplica y el valor anterior y nuevo.
            expect(
                within(confirmation).getByText("01/01/2099"),
            ).toBeInTheDocument();
            expect(within(confirmation).getAllByRole("listitem")).toHaveLength(
                1,
            );
            expect(
                within(confirmation).getByText("Extra diurna"),
            ).toBeInTheDocument();
            expect(within(confirmation).getByText("25 %")).toBeInTheDocument();
            expect(within(confirmation).getByText("30 %")).toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();

            await user.click(
                within(confirmation).getByRole("button", {
                    name: "Confirmar cambios",
                }),
            );

            await waitFor(() =>
                expect(register).toHaveBeenCalledWith({
                    validFrom: "2099-01-01",
                    rates: [{ type: "EXTRA_DIURNA", multiplier: 1.3 }],
                }),
            );
            await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
            expect(await screen.findByTestId("toast")).toHaveTextContent(
                "Los recargos se guardaron. Los nuevos valores rigen desde el 01/01/2099.",
            );
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        it("cierra el formulario al cancelar sin registrar cambios", async () => {
            const user = renderSection();
            await waitForHistory();

            await user.click(
                screen.getByRole("button", { name: "Modificar recargos" }),
            );
            await user.click(screen.getByRole("button", { name: "Cancelar" }));

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();
            expect(findAll).toHaveBeenCalledTimes(1);
        });
    });
});
