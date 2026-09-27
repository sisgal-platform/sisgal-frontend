import { FIELD_LIMITS } from "../constants/employee"

export type EmployeeFormValues = {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  phone: string
  salaryBase: string
  position: string
  branchId: string
}

export type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>

const SOLO_DIGITOS = /^\d+$/

/**
 * Reglas puras del formulario de registro de empleados (CA04, CA05, UI/UX).
 * Espejo de las validaciones del backend (RegisterEmployeeDto + value objects),
 * para dar feedback inmediato antes de llamar a la API.
 */
export function validateEmployeeForm(values: EmployeeFormValues): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {}

  if (!values.firstName.trim()) {
    errors.firstName = "Los nombres son obligatorios."
  } else if (values.firstName.length > FIELD_LIMITS.firstName) {
    errors.firstName = `Máximo ${FIELD_LIMITS.firstName} caracteres.`
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Los apellidos son obligatorios."
  } else if (values.lastName.length > FIELD_LIMITS.lastName) {
    errors.lastName = `Máximo ${FIELD_LIMITS.lastName} caracteres.`
  }

  if (!values.documentType) {
    errors.documentType = "Selecciona el tipo de documento."
  }

  if (!values.documentNumber.trim()) {
    errors.documentNumber = "El número de documento es obligatorio."
  } else if (!SOLO_DIGITOS.test(values.documentNumber)) {
    errors.documentNumber = "El documento debe contener solo dígitos."
  } else if (values.documentNumber.length > FIELD_LIMITS.documentNumber) {
    errors.documentNumber = `Máximo ${FIELD_LIMITS.documentNumber} dígitos.`
  }

  if (!values.phone.trim()) {
    errors.phone = "El teléfono es obligatorio."
  } else if (!SOLO_DIGITOS.test(values.phone)) {
    errors.phone = "El teléfono debe contener solo dígitos."
  } else if (values.phone.length > FIELD_LIMITS.phone) {
    errors.phone = `Máximo ${FIELD_LIMITS.phone} dígitos.`
  }

  const salario = Number(values.salaryBase)
  if (!values.salaryBase.trim()) {
    errors.salaryBase = "El salario es obligatorio."
  } else if (Number.isNaN(salario) || salario <= 0) {
    errors.salaryBase = "El salario debe ser mayor que cero."
  }

  if (!values.position.trim()) {
    errors.position = "Selecciona el cargo."
  } else if (values.position.length > FIELD_LIMITS.position) {
    errors.position = `Máximo ${FIELD_LIMITS.position} caracteres.`
  }

  const branchId = Number(values.branchId)
  if (!values.branchId.trim()) {
    errors.branchId = "Selecciona la sucursal."
  } else if (!Number.isInteger(branchId) || branchId < 1) {
    errors.branchId = "Selecciona una sucursal válida."
  }

  return errors
}

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  documentType: "",
  documentNumber: "",
  phone: "",
  salaryBase: "",
  position: "",
  branchId: "",
}
