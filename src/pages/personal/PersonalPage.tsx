import { RequireRole } from "@/routes/guards/RequireRole"
import { EmpleadosFeature } from "@/features/empleados"

export function PersonalPage() {
  return (
    <RequireRole allowedRoles={["administrador"]}>
      <EmpleadosFeature />
    </RequireRole>
  )
}
