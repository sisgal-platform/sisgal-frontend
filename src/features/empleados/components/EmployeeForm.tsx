import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/molecules/FloatingInput"
import { FloatingSelect } from "@/components/molecules/FloatingSelect"

import { useRegisterEmployee } from "../hooks/useRegisterEmployee"
import { useActivePositions } from "../hooks/useActivePositions"
import { useActiveBranches } from "../hooks/useActiveBranches"
import {
  validateEmployeeForm,
  EMPTY_EMPLOYEE_FORM,
  type EmployeeFormValues,
  type EmployeeFormErrors,
} from "../validation/validateEmployeeForm"
import { DOCUMENT_TYPES, FIELD_LIMITS } from "../constants/employee"
import type { RegisterEmployeePayload } from "../interfaces/types"

type EmployeeFormProps = {
  onSuccess: () => void
}

export function EmployeeForm({ onSuccess }: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_EMPLOYEE_FORM)
  const [errors, setErrors] = useState<EmployeeFormErrors>({})

  const { registerEmployee, enviando } = useRegisterEmployee(() => {
    setValues(EMPTY_EMPLOYEE_FORM)
    setErrors({})
    onSuccess()
  })

  const { positions, cargando: cargandoCargos } = useActivePositions()
  const { branches, cargando: cargandoSucursales } = useActiveBranches()

  function handleChange<K extends keyof EmployeeFormValues>(campo: K, valor: string) {
    setValues((prev) => ({ ...prev, [campo]: valor }))
  }

  // Valida solo el campo que perdió el foco, para no mostrar errores de los
  // demás antes de que el usuario haya llegado a ellos.
  function handleBlur(campo: keyof EmployeeFormValues) {
    const erroresActuales = validateEmployeeForm(values)
    setErrors((prev) => ({ ...prev, [campo]: erroresActuales[campo] }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const erroresValidacion = validateEmployeeForm(values)
    setErrors(erroresValidacion)

    if (Object.keys(erroresValidacion).length > 0) {
      return
    }

    // Los <select> y <input> siempre devuelven string; se convierte a number
    // recién aquí, justo antes de enviar, para que el DTO del backend coincida.
    const payload: RegisterEmployeePayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      documentType: values.documentType as RegisterEmployeePayload["documentType"],
      documentNumber: values.documentNumber.trim(),
      phone: values.phone.trim(),
      salaryBase: Number(values.salaryBase),
      positionId: Number(values.positionId),
      branchId: Number(values.branchId),
    }

    await registerEmployee(payload)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Sección: datos personales */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-sm font-semibold text-text">Datos personales</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FloatingInput
            label="Nombres"
            required
            value={values.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            onBlur={() => handleBlur("firstName")}
            disabled={enviando}
            maxLength={FIELD_LIMITS.firstName}
            error={errors.firstName}
          />

          <FloatingInput
            label="Apellidos"
            required
            value={values.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            onBlur={() => handleBlur("lastName")}
            disabled={enviando}
            maxLength={FIELD_LIMITS.lastName}
            error={errors.lastName}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,160px)_1fr]">
          <FloatingSelect
            label="Tipo de documento"
            required
            value={values.documentType}
            onChange={(e) => handleChange("documentType", e.target.value)}
            onBlur={() => handleBlur("documentType")}
            disabled={enviando}
            error={errors.documentType}
          >
            <option value="">Selecciona…</option>
            {DOCUMENT_TYPES.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.value}
              </option>
            ))}
          </FloatingSelect>

          <FloatingInput
            label="Número de documento"
            required
            inputMode="numeric"
            value={values.documentNumber}
            onChange={(e) => handleChange("documentNumber", e.target.value)}
            onBlur={() => handleBlur("documentNumber")}
            disabled={enviando}
            maxLength={FIELD_LIMITS.documentNumber}
            error={errors.documentNumber}
          />
        </div>

        <FloatingInput
          label="Teléfono"
          required
          inputMode="numeric"
          value={values.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
          disabled={enviando}
          maxLength={FIELD_LIMITS.phone}
          error={errors.phone}
        />
      </fieldset>

      {/* Sección: datos laborales */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-sm font-semibold text-text">Datos laborales</legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FloatingSelect
            label="Cargo"
            required
            value={values.positionId}
            onChange={(e) => handleChange("positionId", e.target.value)}
            onBlur={() => handleBlur("positionId")}
            disabled={enviando || cargandoCargos}
            error={errors.positionId}
          >
            <option value="">
              {cargandoCargos ? "Cargando cargos…" : "Selecciona…"}
            </option>
            {positions.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.name}
              </option>
            ))}
          </FloatingSelect>

          <FloatingSelect
            label="Sucursal"
            required
            value={values.branchId}
            onChange={(e) => handleChange("branchId", e.target.value)}
            onBlur={() => handleBlur("branchId")}
            disabled={enviando || cargandoSucursales}
            error={errors.branchId}
          >
            <option value="">
              {cargandoSucursales ? "Cargando sucursales…" : "Selecciona…"}
            </option>
            {branches.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.name}
              </option>
            ))}
          </FloatingSelect>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FloatingInput
            label="Salario base"
            required
            type="number"
            min="0.01"
            step="0.01"
            prefix="$"
            value={values.salaryBase}
            onChange={(e) => handleChange("salaryBase", e.target.value)}
            onBlur={() => handleBlur("salaryBase")}
            disabled={enviando}
            error={errors.salaryBase}
          />

          <FloatingSelect label="Horario laboral" disabled>
            <option>Próximamente</option>
          </FloatingSelect>
        </div>

        <p className="rounded-lg bg-warning-light px-3 py-2 text-sm text-warning-dark">
          La asignación de horario laboral estará disponible en una próxima entrega.
        </p>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={enviando} className="bg-primary hover:bg-primary-light">
          {enviando ? "Registrando…" : "Registrar empleado"}
        </Button>
      </div>
    </form>
  )
}
