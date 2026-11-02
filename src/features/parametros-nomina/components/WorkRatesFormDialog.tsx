import { useState, type FormEvent } from "react";

import { Modal } from "@/components/molecules/Modal";
import { fechaActual } from "@/features/asistencia/utils/fechas";
import { ApiError } from "@/lib/apiError";
import { formatDateCO } from "@/lib/formatters";

import { WORK_RATE_GROUPS, WORK_RATE_TYPES } from "../constants/workRateTypes";
import { getErrorMessage } from "../hooks/useWorkdayConfig";
import type {
    RegisterWorkRatesPayload,
    WorkRate,
    WorkRateType,
} from "../interfaces/types";
import { workRatesService } from "../services/workRatesService";
import {
    formatSurcharge,
    isValidDate,
    multiplierToPercent,
    percentToMultiplier,
    shiftDate,
} from "../utils/format";
import { FieldInput } from "./FieldInput";

/** Tope del recargo, equivalente al multiplicador máximo que admite el backend (5). */
const MAX_PERCENT = 400;

type LatestRates = Partial<Record<WorkRateType, WorkRate>>;

type Percents = Record<WorkRateType, string>;

type Errors = {
    percents: Partial<Record<WorkRateType, string>>;
    validFrom?: string;
    general?: string;
};

type Change = {
    type: WorkRateType;
    label: string;
    /** Última versión del tipo de hora; null cuando aún no tiene ninguna. */
    latest: WorkRate | null;
    percent: number;
};

const NO_ERRORS: Errors = { percents: {} };

const getPercentError = (value: string): string | undefined => {
    const text = value.trim();

    if (text === "") return "Ingresa el recargo.";
    if (!/^\d+$/.test(text)) {
        return "El recargo debe ser un porcentaje entero, sin decimales ni signo.";
    }
    if (Number(text) > MAX_PERCENT) {
        return `El recargo no puede superar el ${MAX_PERCENT} %.`;
    }

    return undefined;
};

/** Tipos de hora cuyo recargo es distinto al de su última versión. */
const getChanges = (percents: Percents, latest: LatestRates): Change[] =>
    WORK_RATE_TYPES.flatMap(({ type, label }) => {
        const previous = latest[type] ?? null;
        const percent = Number(percents[type]);

        if (previous && multiplierToPercent(previous.multiplier) === percent) {
            return [];
        }

        return [{ type, label, latest: previous, percent }];
    });

/**
 * Mismas reglas que `RegisterWorkRatesDto` y `WorkRateConfigService` en el
 * backend, para dar retroalimentación inmediata junto a cada campo.
 */
const getValidationErrors = (
    percents: Percents,
    validFrom: string,
    latest: LatestRates,
    today: string,
): Errors => {
    const errors: Errors = { percents: {} };

    for (const { type } of WORK_RATE_TYPES) {
        const error = getPercentError(percents[type]);

        if (error) errors.percents[type] = error;
    }

    const validPercents = Object.keys(errors.percents).length === 0;
    const changes = validPercents ? getChanges(percents, latest) : [];

    if (!validFrom) {
        errors.validFrom = "Selecciona la fecha de inicio de vigencia.";
    } else if (!isValidDate(validFrom)) {
        errors.validFrom = "La fecha de inicio de vigencia no es válida.";
    } else if (validFrom < today) {
        errors.validFrom =
            "La fecha de inicio de vigencia no puede ser anterior a la fecha actual.";
    } else {
        // Cada tipo de hora se versiona por separado: la vigencia no puede cruzarse con su última versión.
        const overlapped = changes.find(
            (change) => change.latest && validFrom <= change.latest.validFrom,
        );

        if (overlapped?.latest) {
            errors.validFrom = `El recargo «${overlapped.label}» ya tiene una versión con vigencia desde el ${formatDateCO(overlapped.latest.validFrom)}. La nueva vigencia debe iniciar después de esa fecha.`;
        }
    }

    if (validPercents && !errors.validFrom && changes.length === 0) {
        errors.general =
            "No modificaste ningún recargo. Cambia al menos un valor para guardar.";
    }

    return errors;
};

const hasErrors = (errors: Errors): boolean =>
    Object.keys(errors.percents).length > 0 ||
    Boolean(errors.validFrom) ||
    Boolean(errors.general);

const toPayload = (
    changes: Change[],
    validFrom: string,
): RegisterWorkRatesPayload => ({
    validFrom,
    rates: changes.map(({ type, percent }) => ({
        type,
        multiplier: percentToMultiplier(percent),
    })),
});

const getInitialPercents = (latest: LatestRates): Percents =>
    Object.fromEntries(
        WORK_RATE_TYPES.map(({ type }) => {
            const rate = latest[type];

            return [
                type,
                rate ? String(multiplierToPercent(rate.multiplier)) : "",
            ];
        }),
    ) as Percents;

type WorkRatesFormDialogProps = {
    /** Última versión de cada tipo de hora: precarga el formulario y limita el inicio de la nueva vigencia. */
    latest: LatestRates;
    onClose: () => void;
    onRegistered: (rates: WorkRate[]) => void;
};

/**
 * Formulario de los recargos laborales. Guardar no modifica las versiones
 * existentes: registra una nueva por cada recargo que cambia, a partir de la
 * fecha de vigencia y previa confirmación.
 */
export function WorkRatesFormDialog({
    latest,
    onClose,
    onRegistered,
}: WorkRatesFormDialogProps) {
    const [percents, setPercents] = useState<Percents>(() =>
        getInitialPercents(latest),
    );
    const [validFrom, setValidFrom] = useState("");
    const [errors, setErrors] = useState<Errors>(NO_ERRORS);
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const today = fechaActual();

    function handlePercentBlur(type: WorkRateType) {
        const error = getPercentError(percents[type]);

        setErrors((current) => ({
            ...current,
            percents: { ...current.percents, [type]: error },
        }));
    }

    function handleValidFromBlur() {
        const error = getValidationErrors(percents, validFrom, latest, today)
            .validFrom;

        setErrors((current) => ({ ...current, validFrom: error }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = getValidationErrors(
            percents,
            validFrom,
            latest,
            today,
        );

        setErrors(validationErrors);
        if (hasErrors(validationErrors)) return;

        setConfirming(true);
    }

    async function handleConfirm() {
        setSubmitting(true);

        try {
            const rates = await workRatesService.register(
                toPayload(getChanges(percents, latest), validFrom),
            );
            onRegistered(rates);
        } catch (error) {
            // La vigencia superpuesta (409) se muestra junto a la fecha que la causa.
            setErrors(
                error instanceof ApiError && error.status === 409
                    ? { percents: {}, validFrom: error.message }
                    : { percents: {}, general: getErrorMessage(error) },
            );
            setConfirming(false);
            setSubmitting(false);
        }
    }

    if (confirming) {
        return (
            <Modal
                key="confirm"
                title="Confirmar cambios en los recargos"
                onClose={submitting ? () => {} : onClose}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-base text-text">
                        Los nuevos recargos se usarán en los cálculos de
                        asistencia y nómina a partir del{" "}
                        <strong>{formatDateCO(validFrom)}</strong>. Los
                        cálculos ya procesados no se modifican.
                    </p>

                    <p className="text-sm text-text-muted">
                        Los valores anteriores regirán hasta el{" "}
                        {formatDateCO(shiftDate(validFrom, -1))} y se
                        conservarán en el historial.
                    </p>

                    <ul
                        aria-label="Recargos modificados"
                        className="max-h-[40vh] divide-y divide-gray-200 overflow-y-auto rounded-xl border border-gray-200"
                    >
                        {getChanges(percents, latest).map(
                            ({ type, label, latest: previous, percent }) => (
                                <li
                                    key={type}
                                    className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span className="text-sm font-semibold text-text">
                                        {label}
                                    </span>
                                    <span className="text-sm text-text">
                                        {previous && (
                                            <>
                                                <span className="sr-only">
                                                    Valor anterior:{" "}
                                                </span>
                                                <span className="text-text-muted line-through">
                                                    {formatSurcharge(
                                                        previous.multiplier,
                                                    )}
                                                </span>
                                                <span aria-hidden="true">
                                                    {" → "}
                                                </span>
                                                <span className="sr-only">
                                                    . Valor nuevo:{" "}
                                                </span>
                                            </>
                                        )}
                                        <span className="font-semibold">
                                            {percent} %
                                        </span>
                                    </span>
                                </li>
                            ),
                        )}
                    </ul>

                    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={submitting}
                            className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text hover:bg-secondary disabled:opacity-50"
                        >
                            Volver
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleConfirm()}
                            disabled={submitting}
                            className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Guardando…" : "Confirmar cambios"}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal key="form" title="Modificar recargos" onClose={onClose}>
            <form
                noValidate
                onSubmit={handleSubmit}
                className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1"
            >
                <p className="text-sm text-text-muted">
                    Indica el recargo de cada tipo de hora como porcentaje
                    adicional sobre el valor de la hora ordinaria. Solo se
                    guardan los que cambies.
                </p>

                {WORK_RATE_GROUPS.map((group) => (
                    <div
                        key={group.id}
                        role="group"
                        aria-labelledby={`recargos-grupo-${group.id}`}
                        className="flex flex-col gap-3"
                    >
                        <p
                            id={`recargos-grupo-${group.id}`}
                            className="text-xs font-semibold uppercase tracking-wide text-text-muted"
                        >
                            {group.label}
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {group.types.map(({ type, label }) => (
                                <FieldInput
                                    key={type}
                                    id={`recargo-${type}`}
                                    label={`${label} (%)`}
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    max={MAX_PERCENT}
                                    step={1}
                                    value={percents[type]}
                                    error={errors.percents[type]}
                                    onChange={(event) =>
                                        setPercents((current) => ({
                                            ...current,
                                            [type]: event.target.value,
                                        }))
                                    }
                                    onBlur={() => handlePercentBlur(type)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                <FieldInput
                    id="recargos-vigente-desde"
                    label="Vigente desde"
                    type="date"
                    min={today}
                    hint="Los nuevos recargos aplican a los cálculos desde esta fecha; los anteriores se conservan en el historial."
                    value={validFrom}
                    error={errors.validFrom}
                    onChange={(event) => setValidFrom(event.target.value)}
                    onBlur={handleValidFromBlur}
                />

                {errors.general && (
                    <p
                        role="alert"
                        className="rounded-xl bg-error-light px-3 py-2 text-sm text-error"
                    >
                        {errors.general}
                    </p>
                )}

                <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text hover:bg-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                        Revisar cambios
                    </button>
                </div>
            </form>
        </Modal>
    );
}
