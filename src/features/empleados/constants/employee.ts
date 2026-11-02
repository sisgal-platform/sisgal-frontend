/**
 * Catálogos del formulario de empleados.
 *
 * documentTypes coincide exactamente con el enum DocumentType del backend
 * (src/modules/empleados/domain/value-objects/document-type.enum.ts).
 */
export const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "PEP", label: "Permiso Especial de Permanencia" },
] as const

/** Límites de longitud, iguales a las columnas varchar del backend. */
export const FIELD_LIMITS = {
  firstName: 40,
  lastName: 40,
  documentNumber: 40,
  phone: 20,
} as const
