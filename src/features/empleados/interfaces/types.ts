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
}
