import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/molecules/FloatingInput"
import { FloatingSelect } from "@/components/molecules/FloatingSelect"
import { formatTimeRange } from "@/features/parametros-nomina/utils/format"

import { useRegisterEmployee } from "../hooks/useRegisterEmployee"
import { useUpdateEmployee } from "../hooks/useUpdateEmployee"
import { useActivePositions } from "../hooks/useActivePositions"
import { useActiveBranches } from "../hooks/useActiveBranches"
import { useVigentWorkdayConfig } from "../hooks/useVigentWorkdayConfig"
import {
  validateEmployeeForm,
  fechaLocalHoy,
  EMPTY_EMPLOYEE_FORM,
  type EmployeeFormValues,
  type EmployeeFormErrors,
} from "../validation/validateEmployeeForm"
import { DOCUMENT_TYPES, FIELD_LIMITS } from "../constants/employee"
import type { Employee, RegisterEmployeePayload, UpdateEmployeePayload } from "../interfaces/types"

type EmployeeFormProps = {
  /** Si se recibe, el formulario edita ese empleado en vez de crear uno nuevo. */
  employee?: Employee
  onSuccess: () => void
  /** Muestra los datos sin permitir editarlos (vista de detalle). */
  soloLectura?: boolean
  /** Se dispara al presionar "Actualizar" cuando soloLectura está activo. */
  onSolicitarEdicion?: () => void
}

/** Valores iniciales cuando el formulario edita un empleado existente. */
function valoresDesdeEmpleado(employee: Employee): EmployeeFormValues {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    documentType: employee.documentType,
    documentNumber: employee.document,
    phone: employee.phone,
    salaryBase: String(employee.salaryBase),
    hireDate: employee.hireDate ?? "",
    positionId: employee.positionId ? String(employee.positionId) : "",
    branchId: employee.branchId ? String(employee.branchId) : "",
  }
}

export function EmployeeForm({
  employee,
  onSuccess,
  soloLectura = false,
  onSolicitarEdicion,
}: EmployeeFormProps) {
  const esEdicion = employee !== undefined

  const [values, setValues] = useState<EmployeeFormValues>(() =>
    employee ? valoresDesdeEmpleado(employee) : EMPTY_EMPLOYEE_FORM,
  )
  const [errors, setErrors] = useState<EmployeeFormErrors>({})

  const { registerEmployee, enviando: creando } = useRegisterEmployee(() => {
    setValues(EMPTY_EMPLOYEE_FORM)
    setErrors({})
    onSuccess()
  })
  const { updateEmployee, enviando: actualizando } = useUpdateEmployee(onSuccess)
  const enviando = creando || actualizando

  const { positions, cargando: cargandoCargos } = useActivePositions()
  const { branches, cargando: cargandoSucursales } = useActiveBranches()
  const { workdayConfig, versiones, cargando: cargandoHorario } = useVigentWorkdayConfig()

  // La jornada se guarda aparte del resto de campos: no se valida ni cambia al editar otros datos.
  const [workdayConfigId, setWorkdayConfigId] = useState(
    employee?.workdayConfigId ? String(employee.workdayConfigId) : "",
  )

  // Se puede asignar la vigente; si el empleado conserva una anterior, se lista para no perderla de vista.
  const jornadasAsignables = versiones.filter(
    (v) => v.status === "VIGENTE" || v.id === employee?.workdayConfigId,
  )
  // Al registrar, la vigente viene preseleccionada; al editar, solo cambia si se elige otra.
  const jornadaSeleccionada =
    workdayConfigId || (!esEdicion && workdayConfig ? String(workdayConfig.id) : "")

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

    // En modo detalle no se envía nada; "Actualizar" solo cambia de modo.
    if (soloLectura) {
      onSolicitarEdicion?.()
      return
    }


    const erroresValidacion = validateEmployeeForm(values)
    setErrors(erroresValidacion)

    if (Object.keys(erroresValidacion).length > 0 ) {
      return
    }

    if (esEdicion && employee) {
      const payload: UpdateEmployeePayload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        documentType: values.documentType as UpdateEmployeePayload["documentType"],
        documentNumber: values.documentNumber.trim(),
        phone: values.phone.trim(),
        salaryBase: Number(values.salaryBase),
        positionId: Number(values.positionId),
        branchId: Number(values.branchId),
        hireDate: values.hireDate,
      }
      // Solo se envía si el usuario eligió una jornada distinta a la que ya tenía asignada
      if (jornadaSeleccionada && Number(jornadaSeleccionada) !== employee.workdayConfigId) {
        payload.workdayConfigId = Number(jornadaSeleccionada)
      }
      await updateEmployee(employee.id, payload)
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
      hireDate: values.hireDate,
    }
    if (jornadaSeleccionada) payload.workdayConfigId = Number(jornadaSeleccionada)

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
            disabled={enviando || soloLectura}
            maxLength={FIELD_LIMITS.firstName}
            error={errors.firstName}
          />

          <FloatingInput
            label="Apellidos"
            required
            value={values.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            onBlur={() => handleBlur("lastName")}
            disabled={enviando || soloLectura}
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
            disabled={enviando || soloLectura}
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
            disabled={enviando || soloLectura}
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
          disabled={enviando || soloLectura}
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
            disabled={enviando || soloLectura || cargandoCargos}
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
            disabled={enviando || soloLectura || cargandoSucursales}
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
            disabled={enviando || soloLectura}
            error={errors.salaryBase}
          />

          <FloatingInput
            label="Fecha de ingreso"
            required
            type="date"
            max={fechaLocalHoy()}
            value={values.hireDate}
            onChange={(e) => handleChange("hireDate", e.target.value)}
            onBlur={() => handleBlur("hireDate")}
            disabled={enviando || soloLectura}
            error={errors.hireDate}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FloatingSelect
            label="Horario laboral"
            value={jornadaSeleccionada}
            onChange={(e) => setWorkdayConfigId(e.target.value)}
            disabled={enviando || soloLectura || cargandoHorario}
          >
            {cargandoHorario ? (
              <option value="">Cargando jornada laboral…</option>
            ) : (
              <>
                {(esEdicion || jornadasAsignables.length === 0) && (
                  <option value="">
                    {jornadasAsignables.length === 0
                      ? "No hay una jornada laboral vigente"
                      : "Sin jornada asignada"}
                  </option>
                )}
                {jornadasAsignables.map((jornada) => (
                  <option key={jornada.id} value={String(jornada.id)}>
                    {`Diurna ${formatTimeRange(jornada.dayStart, jornada.dayEnd)} · Nocturna ${formatTimeRange(jornada.nightStart, jornada.nightEnd)} · máx. ${jornada.maxWeekHours}h/semana`}
                    {jornada.status !== "VIGENTE" && " (anterior)"}
                  </option>
                ))}
              </>
            )}
          </FloatingSelect>
        </div>

        <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-text-muted">
          Se listan las jornadas laborales vigentes, configuradas en Parámetros de nómina. Cuando se registra una versión nueva de la jornada, los empleados que la tenían asignada pasan a ella automáticamente.
        </p>
      </fieldset>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={enviando} className="bg-primary hover:bg-primary-light">
          {soloLectura
            ? "Actualizar"
            : enviando
              ? esEdicion
                ? "Guardando…"
                : "Registrando…"
              : esEdicion
                ? "Guardar cambios"
                : "Registrar empleado"}
        </Button>
      </div>
    </form>
  )
}
