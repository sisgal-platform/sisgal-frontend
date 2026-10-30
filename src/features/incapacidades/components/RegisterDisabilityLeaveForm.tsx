import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/molecules/FloatingInput";
import { FloatingSelect } from "@/components/molecules/FloatingSelect";
import { EmployeeCombobox } from "@/features/empleados/components/EmployeeCombobox";

import { useRegisterDisabilityLeave } from "../hooks/useRegisterDisabilityLeave";
import { useActiveEmployees } from "../hooks/useActiveEmployees";
import {
    DISABILITY_TYPES,
    type DisabilityType,
    type RegisterDisabilityLeavePayload,
} from "../interfaces/types";

type RegisterDisabilityLeaveFormProps = {
    onSuccess: () => void;
};

type DisabilityLeaveFormValues = {
    employeeId: string;
    type: DisabilityType | "";
    otherTypeDescription: string;
    startDate: string;
    endDate: string;
};

type DisabilityLeaveFormErrors = Partial<
    Record<keyof DisabilityLeaveFormValues, string>
>;

const EMPTY_DISABILITY_LEAVE_FORM: DisabilityLeaveFormValues = {
    employeeId: "",
    type: "",
    otherTypeDescription: "",
    startDate: "",
    endDate: "",
};

/** Cantidad de días del período, contando ambos extremos. Null si las fechas no son válidas. */
function calculateDays(startDate: string, endDate: string): number | null {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return null;
    if (end < start) return null;

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return (
        Math.round((end.getTime() - start.getTime()) / millisecondsPerDay) + 1
    );
}

/**
 * Reglas puras del formulario de registro de incapacidades.
 * Espejo de las validaciones del backend, para dar feedback inmediato antes de llamar a la API.
 */
function validateDisabilityLeaveForm(
    values: DisabilityLeaveFormValues,
): DisabilityLeaveFormErrors {
    const errors: DisabilityLeaveFormErrors = {};

    const employeeId = Number(values.employeeId);
    if (!values.employeeId.trim()) {
        errors.employeeId = "Selecciona el empleado.";
    } else if (!Number.isInteger(employeeId) || employeeId < 1) {
        errors.employeeId = "Selecciona un empleado válido.";
    }

    if (!values.type) {
        errors.type = "Selecciona el tipo de incapacidad o licencia.";
    } else if (!DISABILITY_TYPES.includes(values.type)) {
        errors.type = "Selecciona un tipo válido.";
    }

    if (values.type === "Otros" && !values.otherTypeDescription.trim()) {
        errors.otherTypeDescription =
            "Describe el tipo de incapacidad o licencia.";
    }

    if (!values.startDate.trim()) {
        errors.startDate = "Selecciona la fecha de inicio.";
    }

    if (!values.endDate.trim()) {
        errors.endDate = "Selecciona la fecha de finalización.";
    } else if (
        values.startDate.trim() &&
        calculateDays(values.startDate, values.endDate) === null
    ) {
        errors.endDate =
            "La fecha de finalización debe ser igual o posterior a la fecha de inicio.";
    }

    return errors;
}

export function RegisterDisabilityLeaveForm({
    onSuccess,
}: RegisterDisabilityLeaveFormProps) {
    const [values, setValues] = useState<DisabilityLeaveFormValues>(
        EMPTY_DISABILITY_LEAVE_FORM,
    );
    const [errors, setErrors] = useState<DisabilityLeaveFormErrors>({});

    const { registerDisabilityLeave, submitting } = useRegisterDisabilityLeave(
        () => {
            setValues(EMPTY_DISABILITY_LEAVE_FORM);
            setErrors({});
            onSuccess();
        },
    );

    const { employees, loading: employeesLoading } = useActiveEmployees();
    const employeeOptions = employees.filter(
        (employee) => employee.status === "ACTIVO",
    );

    const isOther = values.type === "Otros";
    const days = calculateDays(values.startDate, values.endDate);

    function handleChange<K extends keyof DisabilityLeaveFormValues>(
        field: K,
        value: string,
    ) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }

    // Valida solo el campo que perdió el foco, para no mostrar errores de los
    // demás antes de que el usuario haya llegado a ellos.
    function handleBlur(field: keyof DisabilityLeaveFormValues) {
        const currentErrors = validateDisabilityLeaveForm(values);
        setErrors((prev) => ({ ...prev, [field]: currentErrors[field] }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const validationErrors = validateDisabilityLeaveForm(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const payload: RegisterDisabilityLeavePayload = {
            employeeId: Number(values.employeeId),
            type: values.type as DisabilityType,
            startDate: values.startDate,
            endDate: values.endDate,
            ...(isOther
                ? { otherTypeDescription: values.otherTypeDescription.trim() }
                : {}),
        };

        await registerDisabilityLeave(payload);
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6"
        >
            <fieldset className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="incapacidad-empleado"
                        className="text-sm font-semibold text-text"
                    >
                        Empleado{" "}
                        <span aria-hidden="true" className="text-error">
                            *
                        </span>
                    </label>
                    <EmployeeCombobox
                        id="incapacidad-empleado"
                        employees={employeeOptions}
                        value={values.employeeId}
                        onChange={(value) => handleChange("employeeId", value)}
                        onBlur={() => handleBlur("employeeId")}
                        loading={employeesLoading}
                        disabled={submitting || employeesLoading}
                        placeholder={
                            employeesLoading
                                ? "Cargando empleados…"
                                : "Buscar nombre o documento"
                        }
                        allLabel="Selecciona un empleado"
                        aria-invalid={Boolean(errors.employeeId)}
                        aria-describedby={
                            errors.employeeId
                                ? "incapacidad-empleado-error"
                                : undefined
                        }
                    />
                    {errors.employeeId && (
                        <p
                            id="incapacidad-empleado-error"
                            className="text-sm text-error"
                        >
                            {errors.employeeId}
                        </p>
                    )}
                </div>

                <FloatingSelect
                    label="Tipo de incapacidad o licencia"
                    required
                    value={values.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    onBlur={() => handleBlur("type")}
                    disabled={submitting}
                    error={errors.type}
                >
                    <option value="">Selecciona…</option>
                    {DISABILITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </FloatingSelect>

                {isOther && (
                    <FloatingInput
                        label="Especifica el tipo"
                        required
                        value={values.otherTypeDescription}
                        onChange={(e) =>
                            handleChange("otherTypeDescription", e.target.value)
                        }
                        onBlur={() => handleBlur("otherTypeDescription")}
                        disabled={submitting}
                        error={errors.otherTypeDescription}
                    />
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FloatingInput
                        label="Fecha de inicio"
                        type="date"
                        required
                        value={values.startDate}
                        onChange={(e) =>
                            handleChange("startDate", e.target.value)
                        }
                        onBlur={() => handleBlur("startDate")}
                        disabled={submitting}
                        error={errors.startDate}
                    />

                    <FloatingInput
                        label="Fecha de finalización"
                        type="date"
                        required
                        value={values.endDate}
                        onChange={(e) =>
                            handleChange("endDate", e.target.value)
                        }
                        onBlur={() => handleBlur("endDate")}
                        disabled={submitting}
                        error={errors.endDate}
                    />
                </div>

                <FloatingInput
                    label="Cantidad de días"
                    value={days !== null ? String(days) : ""}
                    disabled
                    readOnly
                />
            </fieldset>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-primary-light"
                >
                    {submitting ? "Registrando…" : "Registrar incapacidad"}
                </Button>
            </div>
        </form>
    );
}
