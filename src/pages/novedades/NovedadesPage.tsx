import { NovedadesFeature } from "@/features/novedades";
import { RequireRole } from "@/routes/guards/RequireRole";

export function NovedadesPage() {
    return (
        <RequireRole allowedRoles={["administrador"]}>
            <NovedadesFeature />
        </RequireRole>
    );
}
