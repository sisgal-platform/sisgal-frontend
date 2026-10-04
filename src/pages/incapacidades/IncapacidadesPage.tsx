import { IncapacidadesFeature } from "@/features/incapacidades";
import { RequireRole } from "@/routes/guards/RequireRole";

export function IncapacidadesPage() {
    return (
        <RequireRole allowedRoles={["administrador"]}>
            <IncapacidadesFeature />
        </RequireRole>
    );
}
