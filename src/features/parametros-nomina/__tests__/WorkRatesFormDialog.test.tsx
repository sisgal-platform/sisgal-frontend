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

import { WorkRatesFormDialog } from "../components/WorkRatesFormDialog";
import type { WorkRate, WorkRateType } from "../interfaces/types";
import { workRatesService } from "../services/workRatesService";

const register = vi.spyOn(workRatesService, "register");

type LatestRates = Partial<Record<WorkRateType, WorkRate>>;

function rate(type: WorkRateType, multiplier: number, id: number): WorkRate {
    return {
        id,
        type,
        multiplier,
        validFrom: "2026-01-01",
        validTo: null,
        status: "VIGENTE",
    };
}

const LATEST: LatestRates = {
    ORDINARIA_DIURNA: rate("ORDINARIA_DIURNA", 1, 1),
    ORDINARIA_NOCTURNA: rate("ORDINARIA_NOCTURNA", 1.35, 2),
    EXTRA_DIURNA: rate("EXTRA_DIURNA", 1.25, 3),
    EXTRA_NOCTURNA: rate("EXTRA_NOCTURNA", 1.75, 4),
    DOMINICAL_DIURNA: rate("DOMINICAL_DIURNA", 1.75, 5),
    DOMINICAL_NOCTURNA: rate("DOMINICAL_NOCTURNA", 2.1, 6),
    EXTRA_DOMINICAL_DIURNA: rate("EXTRA_DOMINICAL_DIURNA", 2, 7),
    EXTRA_DOMINICAL_NOCTURNA: rate("EXTRA_DOMINICAL_NOCTURNA", 2.5, 8),
};

/** Fecha de vigencia siempre posterior a la actual. */
const FUTURE_DATE = "2099-01-01";

const EXTRA_DIURNA = /^Extra diurna \(%\)/;
const EXTRA_NOCTURNA = /^Extra nocturna \(%\)/;
const DOMINICAL_NOCTURNA = /^Dominical o festiva nocturna \(%\)/;
const VALID_FROM = /Vigente desde/;

const onClose = vi.fn();
const onRegistered = vi.fn();

function renderDialog(latest: LatestRates = LATEST) {
    const user = userEvent.setup();
    render(
        <WorkRatesFormDialog
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
        name: "Confirmar cambios en los recargos",
    });
}

beforeEach(() => {
    vi.clearAllMocks();
    register.mockReset().mockResolvedValue([
        {
            ...rate("EXTRA_DIURNA", 1.3, 20),
            validFrom: FUTURE_DATE,
            status: "PROGRAMADA",
        },
    ]);
});

describe("WorkRatesFormDialog", () => {
    describe("Formulario", () => {
        it("precarga el recargo de cada tipo de hora como porcentaje", () => {
            renderDialog();

            expect(field(/^Ordinaria diurna \(%\)/)).toHaveValue(0);
            expect(field(/^Ordinaria nocturna \(%\)/)).toHaveValue(35);
            expect(field(EXTRA_DIURNA)).toHaveValue(25);
            expect(field(DOMINICAL_NOCTURNA)).toHaveValue(110);
            expect(
                field(/^Extra dominical o festiva nocturna \(%\)/),
            ).toHaveValue(150);
            expect(field(VALID_FROM)).toHaveValue("");
        });

        it("agrupa los campos en ordinarias y extra, y dominicales y festivos", () => {
            renderDialog();

            expect(
                within(
                    screen.getByRole("group", {
                        name: "Horas ordinarias y extra",
                    }),
                ).getAllByRole("spinbutton"),
            ).toHaveLength(4);
            expect(
                within(
                    screen.getByRole("group", {
                        name: "Dominicales y festivos",
                    }),
                ).getAllByRole("spinbutton"),
            ).toHaveLength(4);
        });
    });

    describe("Validación de campos", () => {
        it("exige el recargo y muestra el mensaje junto al campo", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(field(EXTRA_DIURNA)).toHaveAccessibleDescription(
                "Ingresa el recargo.",
            );
            expect(confirmation()).not.toBeInTheDocument();
        });

        it.each([
            ["401", "El recargo no puede superar el 400 %."],
            [
                "25.5",
                "El recargo debe ser un porcentaje entero, sin decimales ni signo.",
            ],
            [
                "-5",
                "El recargo debe ser un porcentaje entero, sin decimales ni signo.",
            ],
        ])("rechaza un recargo de %s %%", async (value, message) => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, value);
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(field(EXTRA_DIURNA)).toHaveAccessibleDescription(message);
            expect(field(EXTRA_DIURNA)).toHaveAttribute("aria-invalid", "true");
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("acepta los límites del rango permitido", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "0");
            setValue(EXTRA_NOCTURNA, "400");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(confirmation()).toBeInTheDocument();
        });

        it("valida el campo al salir de él", async () => {
            const user = renderDialog();

            await user.clear(field(EXTRA_DIURNA));
            await user.tab();

            expect(field(EXTRA_DIURNA)).toHaveAccessibleDescription(
                "Ingresa el recargo.",
            );
        });
    });

    describe("Vigencia", () => {
        it("exige la fecha de inicio de vigencia", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "30");
            await review(user);

            expect(
                screen.getByText("Selecciona la fecha de inicio de vigencia."),
            ).toBeInTheDocument();
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("rechaza una fecha de vigencia anterior a la actual", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "30");
            setValue(VALID_FROM, "2020-01-01");
            await review(user);

            expect(
                screen.getByText(
                    "La fecha de inicio de vigencia no puede ser anterior a la fecha actual.",
                ),
            ).toBeInTheDocument();
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("impide una vigencia que se superpone con la última versión del recargo modificado", async () => {
            const user = renderDialog({
                ...LATEST,
                EXTRA_DIURNA: {
                    ...rate("EXTRA_DIURNA", 1.25, 3),
                    validFrom: FUTURE_DATE,
                    status: "PROGRAMADA",
                },
            });

            setValue(EXTRA_DIURNA, "30");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(
                screen.getByText(
                    "El recargo «Extra diurna» ya tiene una versión con vigencia desde el 01/01/2099. La nueva vigencia debe iniciar después de esa fecha.",
                ),
            ).toBeInTheDocument();
            expect(confirmation()).not.toBeInTheDocument();
        });

        it("permite la misma fecha cuando el recargo modificado no tiene una versión que se cruce", async () => {
            const user = renderDialog({
                ...LATEST,
                EXTRA_DIURNA: {
                    ...rate("EXTRA_DIURNA", 1.25, 3),
                    validFrom: FUTURE_DATE,
                    status: "PROGRAMADA",
                },
            });

            setValue(EXTRA_NOCTURNA, "80");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(confirmation()).toBeInTheDocument();
        });

        it("no permite guardar cuando ningún recargo cambia", async () => {
            const user = renderDialog();

            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(screen.getByRole("alert")).toHaveTextContent(
                "No modificaste ningún recargo. Cambia al menos un valor para guardar.",
            );
            expect(confirmation()).not.toBeInTheDocument();
        });
    });

    describe("Guardado", () => {
        async function confirmChanges(
            user: ReturnType<typeof userEvent.setup>,
        ) {
            setValue(EXTRA_DIURNA, "30");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);
            await user.click(
                screen.getByRole("button", { name: "Confirmar cambios" }),
            );
        }

        it("no registra los recargos hasta que se confirma", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "30");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            expect(confirmation()).toBeInTheDocument();
            expect(register).not.toHaveBeenCalled();
            expect(onRegistered).not.toHaveBeenCalled();
        });

        it("envía solo los recargos modificados, convertidos a multiplicador", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "30");
            setValue(DOMINICAL_NOCTURNA, "115");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);

            const dialog = confirmation() as HTMLElement;

            expect(within(dialog).getAllByRole("listitem")).toHaveLength(2);
            expect(within(dialog).getByText("110 %")).toBeInTheDocument();
            expect(within(dialog).getByText("115 %")).toBeInTheDocument();

            await user.click(
                within(dialog).getByRole("button", {
                    name: "Confirmar cambios",
                }),
            );

            await waitFor(() => expect(onRegistered).toHaveBeenCalledTimes(1));
            expect(register).toHaveBeenCalledWith({
                validFrom: FUTURE_DATE,
                rates: [
                    { type: "EXTRA_DIURNA", multiplier: 1.3 },
                    { type: "DOMINICAL_NOCTURNA", multiplier: 2.15 },
                ],
            });
        });

        it("registra el primer recargo de un tipo de hora que aún no tiene valor", async () => {
            const latest = { ...LATEST };
            delete latest.EXTRA_NOCTURNA;
            const user = renderDialog(latest);

            expect(field(EXTRA_NOCTURNA)).toHaveValue(null);

            setValue(EXTRA_NOCTURNA, "75");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);
            await user.click(
                screen.getByRole("button", { name: "Confirmar cambios" }),
            );

            await waitFor(() =>
                expect(register).toHaveBeenCalledWith({
                    validFrom: FUTURE_DATE,
                    rates: [{ type: "EXTRA_NOCTURNA", multiplier: 1.75 }],
                }),
            );
        });

        it("permite volver de la confirmación sin guardar ni perder los cambios", async () => {
            const user = renderDialog();

            setValue(EXTRA_DIURNA, "30");
            setValue(VALID_FROM, FUTURE_DATE);
            await review(user);
            await user.click(screen.getByRole("button", { name: "Volver" }));

            expect(field(EXTRA_DIURNA)).toHaveValue(30);
            expect(field(VALID_FROM)).toHaveValue(FUTURE_DATE);
            expect(register).not.toHaveBeenCalled();
        });

        it("muestra junto a la fecha el rechazo del backend por vigencia superpuesta", async () => {
            register.mockRejectedValue(
                new ApiError(
                    409,
                    "El período de vigencia se superpone con el de otra versión de los recargos laborales.",
                ),
            );
            const user = renderDialog();

            await confirmChanges(user);

            expect(
                await screen.findByText(
                    "El período de vigencia se superpone con el de otra versión de los recargos laborales.",
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
            expect(field(EXTRA_DIURNA)).toHaveValue(30);
            expect(onRegistered).not.toHaveBeenCalled();
        });
    });
});
