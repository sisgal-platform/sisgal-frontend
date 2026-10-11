import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";

import { WorkdayConfigFormDialog } from "../components/WorkdayConfigFormDialog";
import type { WorkdayConfig } from "../interfaces/types";
import { workdayConfigService } from "../services/workdayConfigService";

const register = vi.spyOn(workdayConfigService, "register");

const BASE: WorkdayConfig = {
    id: 1,
    maxWeekHours: 44,
    maxDayHours: 8,
    dayStart: "06:00",
    dayEnd: "21:00",
    nightStart: "21:00",
    nightEnd: "06:00",
    validFrom: "2026-01-01",
    validTo: null,
    status: "VIGENTE",
};

/** Fecha de vigencia siempre posterior a la actual. */
const FUTURE_DATE = "2099-01-01";

const onClose = vi.fn();
const onRegistered = vi.fn();

function renderDialog(base: WorkdayConfig | null = BASE) {
    const user = userEvent.setup();
    render(
        <WorkdayConfigFormDialog
            base={base}
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

function isConfirming() {
    return (
        screen.queryByRole("dialog", {
            name: "Confirmar cambios en la jornada laboral",
        }) !== null
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    register.mockReset().mockResolvedValue({
        ...BASE,
        id: 2,
        maxWeekHours: 42,
        validFrom: FUTURE_DATE,
        status: "PROGRAMADA",
    });
});

describe("WorkdayConfigFormDialog", () => {
    describe("Validación de campos", () => {
        it("exige todos los campos y muestra el mensaje junto a cada uno", async () => {
            const user = renderDialog(null);

            await review(user);

            expect(
                screen.getByRole("dialog", { name: "Registrar jornada laboral" }),
            ).toBeInTheDocument();
            expect(field(/Jornada máxima semanal/)).toHaveAccessibleDescription(
                "Ingresa la jornada máxima semanal.",
            );
            expect(field(/Jornada máxima diaria/)).toHaveAccessibleDescription(
                "Ingresa la jornada máxima diaria.",
            );
            expect(
                field(/Inicio de la jornada diurna/),
            ).toHaveAccessibleDescription(
                "Ingresa el inicio de la jornada diurna en formato HH:mm.",
            );
            expect(
                field(/Fin de la jornada nocturna/),
            ).toHaveAccessibleDescription(
                "Ingresa el fin de la jornada nocturna en formato HH:mm.",
            );
            expect(
                screen.getByText("Selecciona la fecha de inicio de vigencia."),
            ).toBeInTheDocument();
            expect(isConfirming()).toBe(false);
        });

        it.each([
            ["0", "La jornada máxima semanal debe estar entre 1 y 168 horas."],
            ["169", "La jornada máxima semanal debe estar entre 1 y 168 horas."],
            [
                "42.5",
                "La jornada máxima semanal debe ser un número entero de horas.",
            ],
        ])(
            "rechaza una jornada semanal de %s horas",
            async (value, message) => {
                const user = renderDialog();

                setValue(/Jornada máxima semanal/, value);
                setValue(/Vigente desde/, FUTURE_DATE);
                await review(user);

                expect(
                    field(/Jornada máxima semanal/),
                ).toHaveAccessibleDescription(message);
                expect(isConfirming()).toBe(false);
            },
        );

        it("rechaza una jornada diaria fuera del rango permitido", async () => {
            const user = renderDialog();

            setValue(/Jornada máxima diaria/, "25");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(field(/Jornada máxima diaria/)).toHaveAccessibleDescription(
                "La jornada máxima diaria debe estar entre 1 y 24 horas.",
            );
            expect(isConfirming()).toBe(false);
        });

        it("rechaza una jornada semanal menor que la diaria", async () => {
            const user = renderDialog();

            setValue(/Jornada máxima semanal/, "6");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(field(/Jornada máxima semanal/)).toHaveAccessibleDescription(
                "La jornada máxima semanal no puede ser menor que la jornada máxima diaria.",
            );
        });

        it("rechaza una jornada diurna que termina antes de iniciar", async () => {
            const user = renderDialog();

            setValue(/Fin de la jornada diurna/, "05:00");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(field(/Fin de la jornada diurna/)).toHaveAccessibleDescription(
                "La jornada diurna debe terminar después de iniciar.",
            );
            expect(isConfirming()).toBe(false);
        });

        it("rechaza una jornada nocturna que no es el complemento de la diurna", async () => {
            const user = renderDialog();

            setValue(/Inicio de la jornada nocturna/, "22:00");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(
                field(/Inicio de la jornada nocturna/),
            ).toHaveAccessibleDescription(
                "La jornada nocturna debe iniciar cuando termina la diurna (9:00 p. m.).",
            );
            expect(isConfirming()).toBe(false);
        });

        it("ajusta la jornada nocturna al cambiar los límites de la diurna", () => {
            renderDialog();

            setValue(/Fin de la jornada diurna/, "19:00");
            setValue(/Inicio de la jornada diurna/, "05:00");

            expect(field(/Inicio de la jornada nocturna/)).toHaveValue("19:00");
            expect(field(/Fin de la jornada nocturna/)).toHaveValue("05:00");
        });

        it("valida el campo al salir de él", async () => {
            const user = renderDialog();

            await user.clear(field(/Jornada máxima semanal/));
            await user.tab();

            expect(field(/Jornada máxima semanal/)).toHaveAccessibleDescription(
                "Ingresa la jornada máxima semanal.",
            );
            expect(field(/Jornada máxima semanal/)).toHaveAttribute(
                "aria-invalid",
                "true",
            );
        });
    });

    describe("Vigencia", () => {
        it("rechaza una fecha de vigencia anterior a la actual", async () => {
            const user = renderDialog();

            setValue(/Jornada máxima semanal/, "42");
            setValue(/Vigente desde/, "2020-01-01");
            await review(user);

            expect(
                screen.getByText(
                    "La fecha de inicio de vigencia no puede ser anterior a la fecha actual.",
                ),
            ).toBeInTheDocument();
            expect(isConfirming()).toBe(false);
        });

        it("impide una vigencia que se superpone con la última versión", async () => {
            const user = renderDialog({ ...BASE, validFrom: FUTURE_DATE });

            setValue(/Jornada máxima semanal/, "42");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(
                screen.getByText(
                    "Ya existe una versión con vigencia desde el 01/01/2099. La nueva vigencia debe iniciar después de esa fecha.",
                ),
            ).toBeInTheDocument();
            expect(isConfirming()).toBe(false);
        });

        it("no permite guardar cuando ningún parámetro cambia", async () => {
            const user = renderDialog();

            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(screen.getByRole("alert")).toHaveTextContent(
                "Los valores son iguales a los de la última versión registrada. Modifica al menos un parámetro para guardar.",
            );
            expect(isConfirming()).toBe(false);
        });
    });

    describe("Guardado", () => {
        async function confirmChanges(
            user: ReturnType<typeof userEvent.setup>,
        ) {
            setValue(/Jornada máxima semanal/, "42");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);
            await user.click(
                screen.getByRole("button", { name: "Confirmar cambios" }),
            );
        }

        it("no registra la versión hasta que se confirma", async () => {
            const user = renderDialog();

            setValue(/Jornada máxima semanal/, "42");
            setValue(/Vigente desde/, FUTURE_DATE);
            await review(user);

            expect(isConfirming()).toBe(true);
            expect(register).not.toHaveBeenCalled();
            expect(onRegistered).not.toHaveBeenCalled();
        });

        it("entrega la versión registrada al confirmar", async () => {
            const user = renderDialog();

            await confirmChanges(user);

            await waitFor(() => expect(onRegistered).toHaveBeenCalledTimes(1));
            expect(onRegistered).toHaveBeenCalledWith(
                expect.objectContaining({ id: 2, validFrom: FUTURE_DATE }),
            );
            expect(register).toHaveBeenCalledWith({
                maxWeekHours: 42,
                maxDayHours: 8,
                dayStart: "06:00",
                dayEnd: "21:00",
                nightStart: "21:00",
                nightEnd: "06:00",
                validFrom: FUTURE_DATE,
            });
        });

        it("muestra junto a la fecha el rechazo del backend por vigencia superpuesta", async () => {
            register.mockRejectedValue(
                new ApiError(
                    409,
                    "El período de vigencia se superpone con el de otra versión de la jornada laboral.",
                ),
            );
            const user = renderDialog();

            await confirmChanges(user);

            expect(
                await screen.findByText(
                    "El período de vigencia se superpone con el de otra versión de la jornada laboral.",
                ),
            ).toBeInTheDocument();
            expect(field(/Vigente desde/)).toHaveAttribute(
                "aria-invalid",
                "true",
            );
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
            expect(field(/Jornada máxima semanal/)).toHaveValue(42);
            expect(onRegistered).not.toHaveBeenCalled();
        });
    });
});
