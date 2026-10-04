import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/molecules/FloatingInput"
import { FloatingSelect } from "@/components/molecules/FloatingSelect"

import { useRegisterDisabilityLeave } from "../hooks/useRegisterDisabilityLeave"
import { useActiveEmployees } from "../hooks/useActiveEmployees"
import {
    TIPOS_INCAPACIDAD,
    type RegisterDisabilityLeavePayload,
    type TipoIncapacidad,
} from "../interfaces/types"

type RegisterDisabilityLeaveFormProps = {
    onSuccess: () => void
}

type DisabilityLeaveFormValues = {
    employeeId: string
    type: TipoIncapacidad | ""
    otherTypeDescription: string
    startDate: string
    endDate: string
}

type DisabilityLeaveFormErrors = Partial<Record<keyof DisabilityLeaveFormValues, string>>

const EMPTY_DISABILITY_LEAVE_FORM: DisabilityLeaveFormValues = {
    employeeId: "",
    type: "",
    otherTypeDescription: "",
    startDate: "",
    endDate: "",
}

/** Cantidad de días del período, contando ambos extremos. Null si las fechas no son válidas. */
function calcularDias(startDate: string, endDate: string): number | null {
    if (!startDate || !endDate) return null

    const inicio = new Date(startDate)
    const fin = new Date(endDate)
    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null
    if (fin < inicio) return null

    const milisegundosPorDia = 1000 * 60 * 60 * 24
    return Math.round((fin.getTime() - inicio.getTime()) / milisegundosPorDia) + 1
}

/**
 * Reglas puras del formulario de registro de incapacidades.
 * Espejo de las validaciones del backend, para dar feedback inmediato antes de llamar a la API.
 */
function validateDisabilityLeaveForm(values: DisabilityLeaveFormValues): DisabilityLeaveFormErrors {
    const errors: DisabilityLeaveFormErrors = {}

    const employeeId = Number(values.employeeId)
    if (!values.employeeId.trim()) {
        errors.employeeId = "Selecciona el empleado."
    } else if (!Number.isInteger(employeeId) || employeeId < 1) {
        errors.employeeId = "Selecciona un empleado válido."
    }

    if (!values.type) {
        errors.type = "Selecciona el tipo de incapacidad o licencia."
    } else if (!TIPOS_INCAPACIDAD.includes(values.type)) {
        errors.type = "Selecciona un tipo válido."
    }

    if (values.type === "Otros" && !values.otherTypeDescription.trim()) {
        errors.otherTypeDescription = "Describe el tipo de incapacidad o licencia."
    }

    if (!values.startDate.trim()) {
        errors.startDate = "Selecciona la fecha de inicio."
    }

    if (!values.endDate.trim()) {
        errors.endDate = "Selecciona la fecha de finalización."
    } else if (
        values.startDate.trim() &&
        calcularDias(values.startDate, values.endDate) === null
    ) {
        errors.endDate = "La fecha de finalización debe ser igual o posterior a la fecha de inicio."
    }

    return errors
}

export function RegisterDisabilityLeaveForm({ onSuccess }: RegisterDisabilityLeaveFormProps) {
    const [values, setValues] = useState<DisabilityLeaveFormValues>(EMPTY_DISABILITY_LEAVE_FORM)
    const [errors, setErrors] = useState<DisabilityLeaveFormErrors>({})

    const { registerDisabilityLeave, enviando } = useRegisterDisabilityLeave(() => {
        setValues(EMPTY_DISABILITY_LEAVE_FORM)
        setErrors({})
        onSuccess()
    })

    const { employees, cargando: cargandoEmpleados } = useActiveEmployees()

    const esOtros = values.type === "Otros"
    const dias = calcularDias(values.startDate, values.endDate)

    function handleChange<K extends keyof DisabilityLeaveFormValues>(campo: K, valor: string) {
        setValues((prev) => ({ ...prev, [campo]: valor }))
    }

    // Valida solo el campo que perdió el foco, para no mostrar errores de los
    // demás antes de que el usuario haya llegado a ellos.
    function handleBlur(campo: keyof DisabilityLeaveFormValues) {
        const erroresActuales = validateDisabilityLeaveForm(values)
        setErrors((prev) => ({ ...prev, [campo]: erroresActuales[campo] }))
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const erroresValidacion = validateDisabilityLeaveForm(values)
        setErrors(erroresValidacion)

        if (Object.keys(erroresValidacion).length > 0) {
            return
        }

        const payload: RegisterDisabilityLeavePayload = {
            employeeId: Number(values.employeeId),
            type: values.type as TipoIncapacidad,
            startDate: values.startDate,
            endDate: values.endDate,
            ...(esOtros ? { otherTypeDescription: values.otherTypeDescription.trim() } : {}),
        }

        await registerDisabilityLeave(payload)
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <fieldset className="flex flex-col gap-4">
                <FloatingSelect
                    label="Empleado"
                    required
                    value={values.employeeId}
                    onChange={(e) => handleChange("employeeId", e.target.value)}
                    onBlur={() => handleBlur("employeeId")}
                    disabled={enviando || cargandoEmpleados}
                    error={errors.employeeId}
                >
                    <option value="">
                        {cargandoEmpleados ? "Cargando empleados…" : "Selecciona…"}
                    </option>
                    {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                        </option>
                    ))}
                </FloatingSelect>

                <FloatingSelect
                    label="Tipo de incapacidad o licencia"
                    required
                    value={values.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    onBlur={() => handleBlur("type")}
                    disabled={enviando}
                    error={errors.type}
                >
                    <option value="">Selecciona…</option>
                    {TIPOS_INCAPACIDAD.map((tipo) => (
                        <option key={tipo} value={tipo}>
                            {tipo}
                        </option>
                    ))}
                </FloatingSelect>

                {esOtros && (
                    <FloatingInput
                        label="Especifica el tipo"
                        required
                        value={values.otherTypeDescription}
                        onChange={(e) => handleChange("otherTypeDescription", e.target.value)}
                        onBlur={() => handleBlur("otherTypeDescription")}
                        disabled={enviando}
                        error={errors.otherTypeDescription}
                    />
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FloatingInput
                        label="Fecha de inicio"
                        type="date"
                        required
                        value={values.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        onBlur={() => handleBlur("startDate")}
                        disabled={enviando}
                        error={errors.startDate}
                    />

                    <FloatingInput
                        label="Fecha de finalización"
                        type="date"
                        required
                        value={values.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        onBlur={() => handleBlur("endDate")}
                        disabled={enviando}
                        error={errors.endDate}
                    />
                </div>

                <FloatingInput
                    label="Cantidad de días"
                    value={dias !== null ? String(dias) : ""}
                    disabled
                    readOnly
                />
            </fieldset>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="submit" disabled={enviando} className="bg-primary hover:bg-primary-light">
                    {enviando ? "Registrando…" : "Registrar incapacidad"}
                </Button>
            </div>
        </form>
    )
}
