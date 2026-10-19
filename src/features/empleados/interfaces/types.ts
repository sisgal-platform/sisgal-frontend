export type DocumentType = 'CC' | 'CE' | 'PA' | 'PEP'

/** Espejo exacto de EmployeeResponseDto (backend). */
export type Employee = {
  id: number
  firstName: string
  lastName: string
  documentType: DocumentType
  document: string
  phone: string
  salaryBase: number
  /** Fecha de ingreso (YYYY-MM-DD); null en empleados registrados antes de la HU16. */
  hireDate: string | null
  position: string
  status: string
  branchId: number | null
  positionId: number | null
  branchName: string | null
  positionName: string | null
}

/** Filtros opcionales del listado. Se envían como query params. */
export type EmployeeListFilters = {
  search?: string
  branchId?: number
  positionId?: number
  status?: 'ACTIVO' | 'INACTIVO'
}

/**
 * Espejo exacto de UpdateEmployeeDto (backend). Si se envía branchId, el
 * backend cierra la asignación de sucursal vigente y abre una nueva.
 */
export type UpdateEmployeePayload = {
  firstName?: string
  lastName?: string
  documentType?: DocumentType
  documentNumber?: string
  phone?: string
  salaryBase?: number
  positionId?: number
  branchId?: number
  hireDate?: string
}

/**
 * Espejo exacto de RegisterEmployeeDto (backend). No se deriva de Employee
 * con Omit porque el campo de documento tiene un nombre distinto en la
 * petición (documentNumber) y en la respuesta (document).
 */
export type RegisterEmployeePayload = {
  firstName: string
  lastName: string
  documentType: DocumentType
  documentNumber: string
  phone: string
  salaryBase: number
  positionId: number
  branchId: number
  /** Fecha de ingreso (YYYY-MM-DD); el formulario siempre la envía. */
  hireDate?: string
}
