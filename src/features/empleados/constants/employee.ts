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

/**
 * Cargos disponibles. El backend acepta texto libre (position: varchar(40)),
 * así que esta lista es solo una ayuda de captura en el frontend.
 */
export const POSITIONS = [
  "Mesero",
  "Cocinero",
  "Chef Ejecutivo",
  "Gerente",
  "Hostess",
  "Ayudante de Cocina",
  "Bartender",
] as const

/**
 * TEMPORAL: sucursales de ejemplo, mientras el equipo entrega
 * GET /sucursales/activas en el frontend. Reemplazar por branchesService
 * cuando esté disponible (ver src/features/empleados/services/branchesService.ts).
 */
export const DEMO_BRANCHES = [
  { id: 1, name: "Sucursal Centro" },
  { id: 2, name: "Sucursal Norte" },
  { id: 3, name: "Sucursal Sur" },
] as const

/** Límites de longitud, iguales a las columnas varchar del backend. */
export const FIELD_LIMITS = {
  firstName: 40,
  lastName: 40,
  documentNumber: 40,
  phone: 20,
  position: 40,
} as const
