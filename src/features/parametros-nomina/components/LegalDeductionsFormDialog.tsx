import { useState, type FormEvent } from "react";

import { Modal } from "@/components/molecules/Modal";
import { fechaActual } from "@/features/asistencia/utils/fechas";
import { ApiError } from "@/lib/apiError";
import { formatDateCO } from "@/lib/formatters";

import { LEGAL_DEDUCTION_TYPES } from "../constants/legalDeductionTypes";
import { getErrorMessage } from "../hooks/useWorkdayConfig";
import type {
    LegalDeduction,
    LegalDeductionType,
    RegisterLegalDeductionsPayload,
} from "../interfaces/types";
import { legalDeductionsService } from "../services/legalDeductionsService";
import { formatPercentage, isValidDate, shiftDate } from "../utils/format";
import { FieldInput } from "./FieldInput";

/** Tope del porcentaje, el mismo que admite el backend. */
const MAX_PERCENTAGE = 100;

/** Número sin signo con máximo dos decimales, la precisión que guarda el backend. */
const PERCENTAGE_PATTERN = /^\d+(\.\d{1,2})?$/;

type LatestDeductions = Partial<Record<LegalDeductionType, LegalDeduction>>;

type Percentages = Record<LegalDeductionType, string>;

type Errors = {
    percentages: Partial<Record<LegalDeductionType, string>>;
    validFrom?: string;
    general?: string;
};

type Change = {
    type: LegalDeductionType;
    label: string;
    /** Última versión del descuento; null cuando aún no tiene ninguna. */
    latest: LegalDeduction | null;
    percentage: number;
};

const NO_ERRORS: Errors = { percentages: {} };

const getPercentageError = (value: string): string | undefined => {
    const text = value.trim();

    if (text === "") return "Ingresa el porcentaje.";
    if (!PERCENTAGE_PATTERN.test(text)) {
        return "El porcentaje debe ser un número sin signo, con máximo dos decimales.";
    }
    if (Number(text) > MAX_PERCENTAGE) {
        return `El porcentaje no puede superar el ${MAX_PERCENTAGE} %.`;
    }

    return undefined;
};

/** Descuentos cuyo porcentaje es distinto al de su última versión. */
const getChanges = (
    percentages: Percentages,
    latest: LatestDeductions,
): Change[] =>
    LEGAL_DEDUCTION_TYPES.flatMap(({ type, label }) => {
        const previous = latest[type] ?? null;
        const percentage = Number(percentages[type]);

        if (previous && previous.percentage === percentage) return [];

        return [{ type, label, latest: previous, percentage }];
    });

/**
 * Mismas reglas que `RegisterLegalDeductionsDto` y `LegalDeductionConfigService`
 * en el backend, para dar retroalimentación inmediata junto a cada campo.
 */
const getValidationErrors = (
    percentages: Percentages,
    validFrom: string,
    latest: LatestDeductions,
    today: string,
): Errors => {
    const errors: Errors = { percentages: {} };

    for (const { type } of LEGAL_DEDUCTION_TYPES) {
        const error = getPercentageError(percentages[type]);

        if (error) errors.percentages[type] = error;
    }

    const validPercentages = Object.keys(errors.percentages).length === 0;
    const changes = validPercentages ? getChanges(percentages, latest) : [];

    if (!validFrom) {
        errors.validFrom = "Selecciona la fecha de inicio de vigencia.";
    } else if (!isValidDate(validFrom)) {
        errors.validFrom = "La fecha de inicio de vigencia no es válida.";
    } else if (validFrom < today) {
        errors.validFrom =
            "La fecha de inicio de vigencia no puede ser anterior a la fecha actual.";
    } else {
        // Cada descuento se versiona por separado: la vigencia no puede cruzarse con su última versión.
        const overlapped = changes.find(
            (change) => change.latest && validFrom <= change.latest.validFrom,
        );

        if (overlapped?.latest) {
            errors.validFrom = `El descuento «${overlapped.label}» ya tiene una versión con vigencia desde el ${formatDateCO(overlapped.latest.validFrom)}. La nueva vigencia debe iniciar después de esa fecha.`;
        }
    }

    if (validPercentages && !errors.validFrom && changes.length === 0) {
        errors.general =
            "No modificaste ningún descuento. Cambia al menos un valor para guardar.";
    }

    return errors;
};

const hasErrors = (errors: Errors): boolean =>
    Object.keys(errors.percentages).length > 0 ||
    Boolean(errors.validFrom) ||
    Boolean(errors.general);

const toPayload = (
    changes: Change[],
    validFrom: string,
): RegisterLegalDeductionsPayload => ({
    validFrom,
    deductions: changes.map(({ type, percentage }) => ({ type, percentage })),
});

const getInitialPercentages = (latest: LatestDeductions): Percentages =>
    Object.fromEntries(
        LEGAL_DEDUCTION_TYPES.map(({ type }) => {
            const deduction = latest[type];

            return [type, deduction ? String(deduction.percentage) : ""];
        }),
    ) as Percentages;

type LegalDeductionsFormDialogProps = {
    /** Última versión de cada descuento: precarga el formulario y limita el inicio de la nueva vigencia. */
    latest: LatestDeductions;
    onClose: () => void;
    onRegistered: (deductions: LegalDeduction[]) => void;
};

/**
 * Formulario de los descuentos legales. Guardar no modifica las versiones
 * existentes: registra una nueva por cada descuento que cambia, a partir de la
 * fecha de vigencia y previa confirmación.
 */
export function LegalDeductionsFormDialog({
    latest,
    onClose,
    onRegistered,
}: LegalDeductionsFormDialogProps) {
    const [percentages, setPercentages] = useState<Percentages>(() =>
        getInitialPercentages(latest),
    );
    const [validFrom, setValidFrom] = useState("");
    const [errors, setErrors] = useState<Errors>(NO_ERRORS);
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const today = fechaActual();

    function handlePercentageBlur(type: LegalDeductionType) {
        const error = getPercentageError(percentages[type]);

        setErrors((current) => ({
            ...current,
            percentages: { ...current.percentages, [type]: error },
        }));
    }

    function handleValidFromBlur() {
        const error = getValidationErrors(
            percentages,
            validFrom,
            latest,
            today,
        ).validFrom;

        setErrors((current) => ({ ...current, validFrom: error }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = getValidationErrors(
            percentages,
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
            const deductions = await legalDeductionsService.register(
                toPayload(getChanges(percentages, latest), validFrom),
            );
            onRegistered(deductions);
        } catch (error) {
            // La vigencia superpuesta (409) se muestra junto a la fecha que la causa.
            setErrors(
                error instanceof ApiError && error.status === 409
                    ? { percentages: {}, validFrom: error.message }
                    : { percentages: {}, general: getErrorMessage(error) },
            );
            setConfirming(false);
            setSubmitting(false);
        }
    }

    if (confirming) {
        return (
            <Modal
                key="confirm"
                title="Confirmar cambios en los descuentos legales"
                onClose={submitting ? () => {} : onClose}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-base text-text">
                        Los nuevos porcentajes se usarán en las liquidaciones
                        de nómina a partir del{" "}
                        <strong>{formatDateCO(validFrom)}</strong>. Las
                        liquidaciones ya procesadas no se modifican.
                    </p>

                    <p className="text-sm text-text-muted">
                        Los valores anteriores regirán hasta el{" "}
                        {formatDateCO(shiftDate(validFrom, -1))} y se
                        conservarán en el historial.
                    </p>

                    <ul
                        aria-label="Descuentos modificados"
                        className="divide-y divide-gray-200 rounded-xl border border-gray-200"
                    >
                        {getChanges(percentages, latest).map(
                            ({ type, label, latest: previous, percentage }) => (
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
                                                    {formatPercentage(
                                                        previous.percentage,
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
                                            {formatPercentage(percentage)}
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
        <Modal
            key="form"
            title="Modificar descuentos legales"
            onClose={onClose}
        >
            <form
                noValidate
                onSubmit={handleSubmit}
                className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1"
            >
                <p className="text-sm text-text-muted">
                    Indica el porcentaje de cada descuento a cargo del
                    empleado sobre la base de cotización. Solo se guardan los
                    que cambies.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {LEGAL_DEDUCTION_TYPES.map(({ type, label }) => (
                        <FieldInput
                            key={type}
                            id={`descuento-${type}`}
                            label={`${label} (%)`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={MAX_PERCENTAGE}
                            step={0.01}
                            value={percentages[type]}
                            error={errors.percentages[type]}
                            onChange={(event) =>
                                setPercentages((current) => ({
                                    ...current,
                                    [type]: event.target.value,
                                }))
                            }
                            onBlur={() => handlePercentageBlur(type)}
                        />
                    ))}
                </div>

                <FieldInput
                    id="descuentos-vigente-desde"
                    label="Vigente desde"
                    type="date"
                    min={today}
                    hint="Los nuevos porcentajes aplican a las liquidaciones desde esta fecha; los anteriores se conservan en el historial."
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
