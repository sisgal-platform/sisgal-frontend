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

import { LegalDeductionsSection } from "../components/LegalDeductionsSection";
import type { LegalDeduction } from "../interfaces/types";
import { legalDeductionsService } from "../services/legalDeductionsService";

const findAll = vi.spyOn(legalDeductionsService, "findAll");
const register = vi.spyOn(legalDeductionsService, "register");

function deduction(
    overrides: Partial<LegalDeduction> & Pick<LegalDeduction, "id" | "type">,
): LegalDeduction {
    return {
        percentage: 4,
        validFrom: "2026-01-01",
        validTo: null,
        status: "VIGENTE",
        ...overrides,
    };
}

const HEALTH_HISTORICAL = deduction({
    id: 3,
    type: "HEALTH_RATE",
    percentage: 3.5,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    status: "HISTORICA",
});

/** Por descuento y, dentro de cada uno, de la versión más reciente a la más antigua. */
const DEDUCTIONS: LegalDeduction[] = [
    deduction({ id: 1, type: "HEALTH_RATE" }),
    HEALTH_HISTORICAL,
    deduction({ id: 2, type: "PENSION_RATE" }),
];

/** Versión registrada en las pruebas: rige desde una fecha siempre futura. */
const REGISTERED = deduction({
    id: 20,
    type: "HEALTH_RATE",
    percentage: 4.5,
    validFrom: "2099-01-01",
    status: "PROGRAMADA",
});

function renderSection() {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <LegalDeductionsSection />
        </ToastProvider>,
    );
    return user;
}

async function waitForHistory() {
    return screen.findByRole("table", {
        name: "Historial de versiones de los descuentos legales",
    });
}

function currentRow(label: string) {
    const card = screen.getByRole("region", { name: "Valores vigentes" });
    return within(card)
        .getByRole("rowheader", { name: label })
        .closest("tr") as HTMLElement;
}

beforeEach(() => {
    findAll.mockReset().mockResolvedValue(DEDUCTIONS);
    register.mockReset().mockResolvedValue([REGISTERED]);
});

describe("Parámetros de nómina: descuentos legales (HU37)", () => {
    describe("Consulta de parámetros", () => {
        it("muestra el porcentaje vigente de cada descuento y su fecha de inicio", async () => {
            renderSection();
            await waitForHistory();

            const salud = currentRow("Salud");

            expect(within(salud).getByText("4 %")).toBeInTheDocument();
            expect(
                within(salud).getByText("Desde el 01/01/2026"),
            ).toBeInTheDocument();
            expect(
                within(currentRow("Pensión")).getByText("4 %"),
            ).toBeInTheDocument();
            expect(findAll).toHaveBeenCalledTimes(1);
        });

        it("muestra los porcentajes con decimales", async () => {
            findAll.mockResolvedValue([
                deduction({ id: 1, type: "HEALTH_RATE", percentage: 4.25 }),
                deduction({ id: 2, type: "PENSION_RATE" }),
            ]);

            renderSection();
            await waitForHistory();

            expect(
                within(currentRow("Salud")).getByText("4,25 %"),
            ).toBeInTheDocument();
        });

        it("señala los descuentos que no tienen un porcentaje vigente", async () => {
            findAll.mockResolvedValue(
                DEDUCTIONS.filter((item) => item.type !== "PENSION_RATE"),
            );

            renderSection();
            await waitForHistory();

            expect(
                within(currentRow("Pensión")).getByText("Sin valor vigente"),
            ).toBeInTheDocument();
        });

        it("informa cuando no hay descuentos registrados", async () => {
            findAll.mockResolvedValue([]);

            renderSection();

            expect(
                await screen.findByText(/No hay descuentos legales vigentes/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    "Aún no hay versiones registradas de los descuentos legales.",
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
                screen.queryByRole("button", { name: "Modificar descuentos" }),
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

            // Encabezado, salud vigente, salud histórica y pensión vigente.
            const [, current, historical] = within(table).getAllByRole("row");

            expect(within(historical).getByText("Salud")).toBeInTheDocument();
            expect(within(historical).getByText("3,5 %")).toBeInTheDocument();
            expect(within(historical).getByText("01/01/2025")).toBeInTheDocument();
            expect(within(historical).getByText("31/12/2025")).toBeInTheDocument();
            expect(within(historical).getByText("Histórica")).toBeInTheDocument();
            expect(historical).toHaveClass("bg-surface-muted", "text-text-muted");

            expect(within(current).getByText("Vigente")).toBeInTheDocument();
            expect(within(current).getByText("Indefinida")).toBeInTheDocument();
            expect(current).not.toHaveClass("bg-surface-muted");
        });

        it("filtra el historial por descuento", async () => {
            const user = renderSection();
            const table = await waitForHistory();

            // Encabezado más las tres versiones.
            expect(within(table).getAllByRole("row")).toHaveLength(4);

            await user.selectOptions(
                screen.getByLabelText("Descuento"),
                "PENSION_RATE",
            );

            expect(within(table).getAllByRole("row")).toHaveLength(2);
            expect(within(table).getByText("Pensión")).toBeInTheDocument();
        });

        it("informa cuando el descuento filtrado no tiene versiones", async () => {
            findAll.mockResolvedValue(
                DEDUCTIONS.filter((item) => item.type !== "PENSION_RATE"),
            );

            const user = renderSection();
            await waitForHistory();

            await user.selectOptions(
                screen.getByLabelText("Descuento"),
                "PENSION_RATE",
            );

            expect(
                screen.getByText(
                    "No hay versiones registradas para este descuento.",
                ),
            ).toBeInTheDocument();
        });

        it("avisa cuando hay descuentos programados que aún no rigen", async () => {
            findAll.mockResolvedValue([REGISTERED, ...DEDUCTIONS]);

            renderSection();
            await waitForHistory();

            expect(screen.getByRole("note")).toHaveTextContent(
                "Hay cambios programados: los descuentos registrados para el 01/01/2099 empezarán a regir en esa fecha.",
            );
            // El valor vigente sigue siendo el anterior hasta esa fecha.
            expect(
                within(currentRow("Salud")).getByText("4 %"),
            ).toBeInTheDocument();
        });
    });

    describe("Modificación de los descuentos", () => {
        it("pide confirmación antes de guardar y registra solo los descuentos modificados", async () => {
            const user = renderSection();
            await waitForHistory();

            await user.click(
                screen.getByRole("button", { name: "Modificar descuentos" }),
            );
            const dialog = screen.getByRole("dialog", {
                name: "Modificar descuentos legales",
            });
            const salud = within(dialog).getByLabelText(/^Salud \(%\)/);

            expect(salud).toHaveValue(4);

            fireEvent.change(salud, { target: { value: "4.5" } });
            fireEvent.change(within(dialog).getByLabelText(/Vigente desde/), {
                target: { value: "2099-01-01" },
            });
            await user.click(
                within(dialog).getByRole("button", { name: "Revisar cambios" }),
            );

            const confirmation = screen.getByRole("dialog", {
                name: "Confirmar cambios en los descuentos legales",
            });

            // La confirmación muestra desde cuándo aplica y el valor anterior y nuevo.
            expect(
                within(confirmation).getByText("01/01/2099"),
            ).toBeInTheDocument();
            expect(
                within(confirmation).getByText(/regirán hasta el 31\/12\/2098/),
            ).toBeInTheDocument();
            expect(within(confirmation).getAllByRole("listitem")).toHaveLength(
                1,
            );
            expect(within(confirmation).getByText("Salud")).toBeInTheDocument();
            expect(within(confirmation).getByText("4 %")).toBeInTheDocument();
            expect(within(confirmation).getByText("4,5 %")).toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();

            await user.click(
                within(confirmation).getByRole("button", {
                    name: "Confirmar cambios",
                }),
            );

            await waitFor(() =>
                expect(register).toHaveBeenCalledWith({
                    validFrom: "2099-01-01",
                    deductions: [{ type: "HEALTH_RATE", percentage: 4.5 }],
                }),
            );
            await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
            expect(await screen.findByTestId("toast")).toHaveTextContent(
                "Los descuentos legales se guardaron. Los nuevos valores rigen desde el 01/01/2099.",
            );
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        it("cierra el formulario al cancelar sin registrar cambios", async () => {
            const user = renderSection();
            await waitForHistory();

            await user.click(
                screen.getByRole("button", { name: "Modificar descuentos" }),
            );
            await user.click(screen.getByRole("button", { name: "Cancelar" }));

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();
            expect(findAll).toHaveBeenCalledTimes(1);
        });
    });
});
