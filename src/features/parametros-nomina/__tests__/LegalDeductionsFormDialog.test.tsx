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

import { LegalDeductionsFormDialog } from "../components/LegalDeductionsFormDialog";
import type { LegalDeduction, LegalDeductionType } from "../interfaces/types";
import { legalDeductionsService } from "../services/legalDeductionsService";

const register = vi.spyOn(legalDeductionsService, "register");

type LatestDeductions = Partial<Record<LegalDeductionType, LegalDeduction>>;

function deduction(
    type: LegalDeductionType,
    percentage: number,
    id: number,
): LegalDeduction {
    return {
        id,
        type,
        percentage,
        validFrom: "2026-01-01",
        validTo: null,
        status: "VIGENTE",
    };
}

const LATEST: LatestDeductions = {
    HEALTH_RATE: deduction("HEALTH_RATE", 4, 1),
    PENSION_RATE: deduction("PENSION_RATE", 4, 2),
};

/** Fecha de vigencia siempre posterior a la actual. */
const FUTURE_DATE = "2099-01-01";

const SALUD = /^Salud \(%\)/;
const PENSION = /^Pensión \(%\)/;
const VALID_FROM = /Vigente desde/;

const onClose = vi.fn();
const onRegistered = vi.fn();

function renderDialog(latest: LatestDeductions = LATEST) {
    const user = userEvent.setup();
    render(
        <LegalDeductionsFormDialog
            latest={latest}
            onClose={onClose}
            onRegistered={onRegistered}
        />,
    );
    return user;
}

function field(label: RegExp) {
    return screen.getByLabelText(label);
}

function setValue(label: RegExp, value: string) {
    fireEvent.change(field(label), { target: { value } });
}

async function review(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Revisar cambios" }));
}

function confirmation() {
    return screen.queryByRole("dialog", {
        name: "Confirmar cambios en los descuentos legales",
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    register.mockReset().mockResolvedValue([
        {
            ...deduction("HEALTH_RATE", 4.5, 20),
            validFrom: FUTURE_DATE,
            status: "PROGRAMADA",
        },
    ]);
});

describe("LegalDeductionsFormDialog", () => {
    describe("Formulario", () => {
        it("precarga el porcentaje de cada descuento", () => {
            renderDialog({
                ...LATEST,
                PENSION_RATE: deduction("PENSION_RATE", 4.25, 2),
            });

            expect(field(SALUD)).toHaveValue(4);
            expect(field(PENSION)).toHaveValue(4.25);
            expect(field(VALID_FROM)).toHaveValue("");
        });
    });

    describe("Validación de campos", () => {
        it("exige el porcentaje y muestra el mensaje junto al campo", async () => {
            const user = renderDialog();

            setValue(SALUD, "");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(field(SALUD)).toHaveAccessibleDescription(
                "Ingresa el porcentaje.",
            );
            expect(confirmation()).not.toBeInTheDocument();
        });

        it.each([
            ["100.01", "El porcentaje no puede superar el 100 %."],
            [
                "4.555",
                "El porcentaje debe ser un número sin signo, con máximo dos decimales.",
            ],
            [
                "-1",
                "El porcentaje debe ser un número sin signo, con máximo dos decimales.",
            ],
        ])("rechaza un porcentaje de %s %%", async (value, message) => {
            const user = renderDialog();

            setValue(SALUD, value);
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(field(SALUD)).toHaveAccessibleDescription(message);
            expect(field(SALUD)).toHaveAttribute("aria-invalid", "true");
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("acepta los límites del rango permitido", async () => {
            const user = renderDialog();

            setValue(SALUD, "0");
            setValue(PENSION, "100");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(confirmation()).toBeInTheDocument();
        });

        it("valida el campo al salir de él", async () => {
            const user = renderDialog();

            await user.clear(field(SALUD));
            await user.tab();

            expect(field(SALUD)).toHaveAccessibleDescription(
                "Ingresa el porcentaje.",
            );
        });
    });

    describe("Vigencia", () => {
        it("exige la fecha de inicio de vigencia", async () => {
            const user = renderDialog();

            setValue(SALUD, "4.5");
            await review(user);

            expect(
                screen.getByText("Selecciona la fecha de inicio de vigencia."),
            ).toBeInTheDocument();
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("rechaza una fecha de vigencia anterior a la actual", async () => {
            const user = renderDialog();

            setValue(SALUD, "4.5");
            setValue(VALID_FROM, "2020-01-01");
            await review(user);

            expect(
                screen.getByText(
                    "La fecha de inicio de vigencia no puede ser anterior a la fecha actual.",
                ),
            ).toBeInTheDocument();
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("impide una vigencia que se superpone con la última versión del descuento modificado", async () => {
            const user = renderDialog({
                ...LATEST,
                HEALTH_RATE: {
                    ...deduction("HEALTH_RATE", 4, 1),
                    validFrom: FUTURE_DATE,
                    status: "PROGRAMADA",
                },
            });

            setValue(SALUD, "4.5");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(
                screen.getByText(
                    "El descuento «Salud» ya tiene una versión con vigencia desde el 01/01/2099. La nueva vigencia debe iniciar después de esa fecha.",
                ),
            ).toBeInTheDocument();
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("permite la misma fecha cuando el descuento modificado no tiene una versión que se cruce", async () => {
            const user = renderDialog({
                ...LATEST,
                HEALTH_RATE: {
                    ...deduction("HEALTH_RATE", 4, 1),
                    validFrom: FUTURE_DATE,
                    status: "PROGRAMADA",
                },
            });

            setValue(PENSION, "4.5");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(confirmation()).toBeInTheDocument();
        });

        it("no permite guardar cuando ningún descuento cambia", async () => {
            const user = renderDialog();

            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(screen.getByRole("alert")).toHaveTextContent(
                "No modificaste ningún descuento. Cambia al menos un valor para guardar.",
            );
            expect(confirmation()).not.toBeInTheDocument();
        });
    });

    describe("Guardado", () => {
        async function confirmChanges(
            user: ReturnType<typeof userEvent.setup>,
        ) {
            setValue(SALUD, "4.5");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);
            await user.click(
                screen.getByRole("button", { name: "Confirmar cambios" }),
            );
        }

        it("no registra los descuentos hasta que se confirma", async () => {
            const user = renderDialog();

            setValue(SALUD, "4.5");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(confirmation()).toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();
            expect(onRegistered).not.toHaveBeenCalled();
        });

        it("envía solo los descuentos modificados", async () => {
            const user = renderDialog();

            setValue(PENSION, "4.25");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            const dialog = confirmation() as HTMLElement;

            expect(within(dialog).getAllByRole("listitem")).toHaveLength(1);
            expect(within(dialog).getByText("Pensión")).toBeInTheDocument();
            expect(within(dialog).getByText("4 %")).toBeInTheDocument();
            expect(within(dialog).getByText("4,25 %")).toBeInTheDocument();

            await user.click(
                within(dialog).getByRole("button", {
                    name: "Confirmar cambios",
                }),
            );

            await waitFor(() => expect(onRegistered).toHaveBeenCalledTimes(1));
            expect(register).toHaveBeenCalledWith({
                validFrom: FUTURE_DATE,
                deductions: [{ type: "PENSION_RATE", percentage: 4.25 }],
            });
        });

        it("envía juntos los dos descuentos cuando ambos cambian", async () => {
            const user = renderDialog();

            setValue(SALUD, "4.5");
            setValue(PENSION, "5");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            const dialog = confirmation() as HTMLElement;

            expect(within(dialog).getAllByRole("listitem")).toHaveLength(2);

            await user.click(
                within(dialog).getByRole("button", {
                    name: "Confirmar cambios",
                }),
            );

            await waitFor(() =>
                expect(register).toHaveBeenCalledWith({
                    validFrom: FUTURE_DATE,
                    deductions: [
                        { type: "HEALTH_RATE", percentage: 4.5 },
                        { type: "PENSION_RATE", percentage: 5 },
                    ],
                }),
            );
        });

        it("registra el primer porcentaje de un descuento que aún no tiene valor", async () => {
            const latest = { ...LATEST };
            delete latest.PENSION_RATE;
            const user = renderDialog(latest);

            expect(field(PENSION)).toHaveValue(null);

            setValue(PENSION, "4");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);
            await user.click(
                screen.getByRole("button", { name: "Confirmar cambios" }),
            );

            await waitFor(() =>
                expect(register).toHaveBeenCalledWith({
                    validFrom: FUTURE_DATE,
                    deductions: [{ type: "PENSION_RATE", percentage: 4 }],
                }),
            );
        });

        it("permite volver de la confirmación sin guardar ni perder los cambios", async () => {
            const user = renderDialog();

            setValue(SALUD, "4.5");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);
            await user.click(screen.getByRole("button", { name: "Volver" }));

            expect(field(SALUD)).toHaveValue(4.5);
            expect(field(VALID_FROM)).toHaveValue(FUTURE_DATE);
            expect(register).not.toHaveBeenCalled();
        });

        it("muestra junto a la fecha el rechazo del backend por vigencia superpuesta", async () => {
            register.mockRejectedValue(
                new ApiError(
                    409,
                    "El período de vigencia se superpone con el de otra versión de los descuentos legales.",
                ),
            );
            const user = renderDialog();

            await confirmChanges(user);

            expect(
                await screen.findByText(
                    "El período de vigencia se superpone con el de otra versión de los descuentos legales.",
                ),
            ).toBeInTheDocument();
            expect(field(VALID_FROM)).toHaveAttribute("aria-invalid", "true");
            expect(onRegistered).not.toHaveBeenCalled();
        });

        it("vuelve al formulario con el error cuando falla el guardado", async () => {
            register.mockRejectedValue(
                new ApiError(
                    0,
                    "No fue posible conectar con el servidor. Intenta de nuevo.",
                ),
            );
            const user = renderDialog();

            await confirmChanges(user);

            expect(await screen.findByRole("alert")).toHaveTextContent(
                "No fue posible conectar con el servidor. Intenta de nuevo.",
            );
            // Los valores diligenciados se conservan para reintentar.
            expect(field(SALUD)).toHaveValue(4.5);
            expect(onRegistered).not.toHaveBeenCalled();
        });
    });
});
