import {
    useState,
    type ChangeEvent,
    type FormEvent,
    type InputHTMLAttributes,
} from "react";

import { Modal } from "@/components/molecules/Modal";
import { fechaActual } from "@/features/asistencia/utils/fechas";
import { ApiError } from "@/lib/apiError";
import { formatDateCO } from "@/lib/formatters";

import { getErrorMessage } from "../hooks/useWorkdayConfig";
import type {
    RegisterWorkdayConfigPayload,
    WorkdayConfig,
} from "../interfaces/types";
import { workdayConfigService } from "../services/workdayConfigService";
import { formatHours, formatTime, shiftDate } from "../utils/format";

const MAX_WEEK_HOURS = 168;
const MAX_DAY_HOURS = 24;
const DAYS_PER_WEEK = 7;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type Values = {
    maxWeekHours: string;
    maxDayHours: string;
    dayStart: string;
    dayEnd: string;
    nightStart: string;
    nightEnd: string;
    validFrom: string;
};

type Field = keyof Values;

type Errors = Partial<Record<Field, string>> & { general?: string };

type Change = {
    label: string;
    previous: string | null;
    next: string;
};

const TIME_FIELDS = [
    ["dayStart", "el inicio de la jornada diurna"],
    ["dayEnd", "el fin de la jornada diurna"],
    ["nightStart", "el inicio de la jornada nocturna"],
    ["nightEnd", "el fin de la jornada nocturna"],
] as const;

const parseHours = (value: string): number | null =>
    /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;

const isValidDate = (value: string): boolean => {
    if (!DATE_PATTERN.test(value)) return false;

    const date = new Date(`${value}T00:00:00Z`);

    // Descarta fechas que no existen en el calendario, como el 30 de febrero.
    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
};

const getHoursError = (
    value: string,
    name: string,
    max: number,
): string | undefined => {
    const hours = parseHours(value);

    if (value.trim() === "") return `Ingresa la ${name}.`;
    if (hours === null) {
        return `La ${name} debe ser un número entero de horas.`;
    }
    if (hours < 1 || hours > max) {
        return `La ${name} debe estar entre 1 y ${max} horas.`;
    }

    return undefined;
};

/**
 * Mismas reglas que `RegisterWorkdayConfigDto` y `WorkdayConfigService` en el
 * backend, para dar retroalimentación inmediata junto a cada campo.
 */
const getValidationErrors = (
    values: Values,
    base: WorkdayConfig | null,
    today: string,
): Errors => {
    const errors: Errors = {};

    const weekError = getHoursError(
        values.maxWeekHours,
        "jornada máxima semanal",
        MAX_WEEK_HOURS,
    );
    const dayError = getHoursError(
        values.maxDayHours,
        "jornada máxima diaria",
        MAX_DAY_HOURS,
    );

    if (weekError) errors.maxWeekHours = weekError;
    if (dayError) errors.maxDayHours = dayError;

    if (!weekError && !dayError) {
        const maxWeekHours = Number(values.maxWeekHours);
        const maxDayHours = Number(values.maxDayHours);

        if (maxWeekHours < maxDayHours) {
            errors.maxWeekHours =
                "La jornada máxima semanal no puede ser menor que la jornada máxima diaria.";
        } else if (maxWeekHours > maxDayHours * DAYS_PER_WEEK) {
            errors.maxWeekHours =
                "La jornada máxima semanal no puede superar siete veces la jornada máxima diaria.";
        }
    }

    for (const [field, name] of TIME_FIELDS) {
        if (!TIME_PATTERN.test(values[field])) {
            errors[field] = `Ingresa ${name} en formato HH:mm.`;
        }
    }

    // Las horas HH:mm se comparan como texto: su orden coincide con el del día.
    if (!errors.dayStart && !errors.dayEnd && values.dayStart >= values.dayEnd) {
        errors.dayEnd = "La jornada diurna debe terminar después de iniciar.";
    }

    // La franja nocturna es el complemento de la diurna, para que ninguna hora quede sin clasificar.
    if (
        !errors.nightStart &&
        !errors.dayEnd &&
        values.nightStart !== values.dayEnd
    ) {
        errors.nightStart = `La jornada nocturna debe iniciar cuando termina la diurna (${formatTime(values.dayEnd)}).`;
    }
    if (
        !errors.nightEnd &&
        !errors.dayStart &&
        values.nightEnd !== values.dayStart
    ) {
        errors.nightEnd = `La jornada nocturna debe terminar cuando inicia la diurna (${formatTime(values.dayStart)}).`;
    }

    if (!values.validFrom) {
        errors.validFrom = "Selecciona la fecha de inicio de vigencia.";
    } else if (!isValidDate(values.validFrom)) {
        errors.validFrom = "La fecha de inicio de vigencia no es válida.";
    } else if (values.validFrom < today) {
        errors.validFrom =
            "La fecha de inicio de vigencia no puede ser anterior a la fecha actual.";
    } else if (base && values.validFrom <= base.validFrom) {
        errors.validFrom = `Ya existe una versión con vigencia desde el ${formatDateCO(base.validFrom)}. La nueva vigencia debe iniciar después de esa fecha.`;
    }

    if (
        base &&
        Object.keys(errors).length === 0 &&
        describeChanges(base, toPayload(values)).length === 0
    ) {
        errors.general =
            "Los valores son iguales a los de la última versión registrada. Modifica al menos un parámetro para guardar.";
    }

    return errors;
};

const toPayload = (values: Values): RegisterWorkdayConfigPayload => ({
    maxWeekHours: Number(values.maxWeekHours),
    maxDayHours: Number(values.maxDayHours),
    dayStart: values.dayStart,
    dayEnd: values.dayEnd,
    nightStart: values.nightStart,
    nightEnd: values.nightEnd,
    validFrom: values.validFrom,
});

/** Parámetros cuyo valor cambia respecto a la versión base, con el valor anterior y el nuevo. */
const describeChanges = (
    base: WorkdayConfig | null,
    payload: RegisterWorkdayConfigPayload,
): Change[] => {
    const changes: Change[] = [
        {
            label: "Jornada máxima semanal",
            previous: base ? formatHours(base.maxWeekHours) : null,
            next: formatHours(payload.maxWeekHours),
        },
        {
            label: "Jornada máxima diaria",
            previous: base ? formatHours(base.maxDayHours) : null,
            next: formatHours(payload.maxDayHours),
        },
        {
            label: "Inicio de la jornada diurna",
            previous: base ? formatTime(base.dayStart) : null,
            next: formatTime(payload.dayStart),
        },
        {
            label: "Fin de la jornada diurna",
            previous: base ? formatTime(base.dayEnd) : null,
            next: formatTime(payload.dayEnd),
        },
        {
            label: "Inicio de la jornada nocturna",
            previous: base ? formatTime(base.nightStart) : null,
            next: formatTime(payload.nightStart),
        },
        {
            label: "Fin de la jornada nocturna",
            previous: base ? formatTime(base.nightEnd) : null,
            next: formatTime(payload.nightEnd),
        },
    ];

    return changes.filter(({ previous, next }) => previous !== next);
};

const getInitialValues = (base: WorkdayConfig | null): Values => ({
    maxWeekHours: base ? String(base.maxWeekHours) : "",
    maxDayHours: base ? String(base.maxDayHours) : "",
    dayStart: base?.dayStart ?? "",
    dayEnd: base?.dayEnd ?? "",
    nightStart: base?.nightStart ?? "",
    nightEnd: base?.nightEnd ?? "",
    // La fecha de vigencia siempre se elige de forma explícita.
    validFrom: "",
});

type WorkdayConfigFormDialogProps = {
    /** Última versión registrada: precarga el formulario y limita el inicio de la nueva vigencia. */
    base: WorkdayConfig | null;
    onClose: () => void;
    onRegistered: (version: WorkdayConfig) => void;
};

/**
 * Formulario de la jornada laboral. Guardar no modifica la versión existente:
 * registra una nueva a partir de la fecha de vigencia, previa confirmación.
 */
export function WorkdayConfigFormDialog({
    base,
    onClose,
    onRegistered,
}: WorkdayConfigFormDialogProps) {
    const [values, setValues] = useState<Values>(() => getInitialValues(base));
    const [errors, setErrors] = useState<Errors>({});
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const today = fechaActual();
    // La nueva vigencia no puede iniciar antes de hoy ni superponerse con la última versión.
    const dayAfterBase = base ? shiftDate(base.validFrom, 1) : today;
    const minValidFrom = dayAfterBase > today ? dayAfterBase : today;

    function handleChange(field: Field, value: string) {
        setValues((current) => {
            const next = { ...current, [field]: value };

            // La franja nocturna se ajusta sola mientras siga siendo el complemento de la diurna.
            if (field === "dayEnd" && current.nightStart === current.dayEnd) {
                next.nightStart = value;
            }
            if (field === "dayStart" && current.nightEnd === current.dayStart) {
                next.nightEnd = value;
            }

            return next;
        });
    }

    function handleBlur(field: Field) {
        const fieldError = getValidationErrors(values, base, today)[field];

        setErrors((current) => ({ ...current, [field]: fieldError }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = getValidationErrors(values, base, today);

        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setConfirming(true);
    }

    async function handleConfirm() {
        setSubmitting(true);

        try {
            const version = await workdayConfigService.register(
                toPayload(values),
            );
            onRegistered(version);
        } catch (error) {
            // La vigencia superpuesta (409) se muestra junto a la fecha que la causa.
            setErrors(
                error instanceof ApiError && error.status === 409
                    ? { validFrom: error.message }
                    : { general: getErrorMessage(error) },
            );
            setConfirming(false);
            setSubmitting(false);
        }
    }

    const fieldProps = (field: Field) => ({
        value: values[field],
        error: errors[field],
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
            handleChange(field, event.target.value),
        onBlur: () => handleBlur(field),
    });

    if (confirming) {
        const payload = toPayload(values);

        return (
            <Modal
                key="confirm"
                title="Confirmar cambios en la jornada laboral"
                onClose={submitting ? () => {} : onClose}
            >
                <div className="flex flex-col gap-4">
                    <p className="text-base text-text">
                        Los nuevos valores se usarán en los cálculos de
                        asistencia y nómina a partir del{" "}
                        <strong>{formatDateCO(payload.validFrom)}</strong>. Los
                        cálculos ya procesados no se modifican.
                    </p>

                    {base && (
                        <p className="text-sm text-text-muted">
                            La versión anterior regirá hasta el{" "}
                            {formatDateCO(shiftDate(payload.validFrom, -1))} y
                            se conservará en el historial.
                        </p>
                    )}

                    <ul
                        aria-label="Parámetros modificados"
                        className="divide-y divide-gray-200 rounded-xl border border-gray-200"
                    >
                        {describeChanges(base, payload).map(
                            ({ label, previous, next }) => (
                                <li
                                    key={label}
                                    className="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span className="text-sm font-semibold text-text">
                                        {label}
                                    </span>
                                    <span className="text-sm text-text">
                                        {previous !== null && (
                                            <>
                                                <span className="sr-only">
                                                    Valor anterior:{" "}
                                                </span>
                                                <span className="text-text-muted line-through">
                                                    {previous}
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
                                            {next}
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
            title={
                base ? "Modificar jornada laboral" : "Registrar jornada laboral"
            }
            onClose={onClose}
        >
            <form
                noValidate
                onSubmit={handleSubmit}
                className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FieldInput
                        id="jornada-max-semanal"
                        label="Jornada máxima semanal (horas)"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={MAX_WEEK_HOURS}
                        step={1}
                        {...fieldProps("maxWeekHours")}
                    />
                    <FieldInput
                        id="jornada-max-diaria"
                        label="Jornada máxima diaria (horas)"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={MAX_DAY_HOURS}
                        step={1}
                        {...fieldProps("maxDayHours")}
                    />
                    <FieldInput
                        id="jornada-diurna-inicio"
                        label="Inicio de la jornada diurna"
                        type="time"
                        {...fieldProps("dayStart")}
                    />
                    <FieldInput
                        id="jornada-diurna-fin"
                        label="Fin de la jornada diurna"
                        type="time"
                        {...fieldProps("dayEnd")}
                    />
                    <FieldInput
                        id="jornada-nocturna-inicio"
                        label="Inicio de la jornada nocturna"
                        type="time"
                        {...fieldProps("nightStart")}
                    />
                    <FieldInput
                        id="jornada-nocturna-fin"
                        label="Fin de la jornada nocturna"
                        type="time"
                        {...fieldProps("nightEnd")}
                    />
                </div>

                <FieldInput
                    id="jornada-vigente-desde"
                    label="Vigente desde"
                    type="date"
                    min={minValidFrom}
                    hint="Los nuevos valores aplican a los cálculos desde esta fecha; la versión anterior se conserva en el historial."
                    {...fieldProps("validFrom")}
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

type FieldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
    id: string;
    label: string;
    error?: string;
    hint?: string;
};

/** Campo obligatorio con su etiqueta y el mensaje de validación junto a él. */
function FieldInput({ id, label, error, hint, ...props }: FieldInputProps) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy =
        [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-text">
                {label}{" "}
                <span aria-hidden="true" className="text-error">
                    *
                </span>
            </label>
            <input
                id={id}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className="h-11 rounded-xl border border-gray-300 px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid]:border-error"
                {...props}
            />
            {hint && (
                <p id={hintId} className="text-xs text-text-muted">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
}
