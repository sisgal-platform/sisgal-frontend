import { AsistenciaFeature } from "@/features/asistencia";
import { RequireRole } from "@/routes/guards/RequireRole";

export function AsistenciaPage() {
    return (
        <RequireRole allowedRoles={["administrador"]}>
            <AsistenciaFeature />
        </RequireRole>
    );
}
