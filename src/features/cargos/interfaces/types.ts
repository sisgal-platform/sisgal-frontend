/** Cargo tal como lo expone `PositionResponseDto` en el backend. */
export type Cargo = {
  id: number
  name: string
  description: string | null
  is_active: boolean
}

/** Cuerpo de creación/actualización (`CrearCargoDto` / `ActualizarCargoDto`). */
export type CargoInput = {
  nombre: string
  descripcion: string
}

export type FiltroEstado = 'todos' | 'activos' | 'inactivos'
