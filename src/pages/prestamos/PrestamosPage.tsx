import { PrestamosFeature } from "@/features/prestamos";
import { RequireRole } from "@/routes/guards/RequireRole";

export function PrestamosPage() {
    return (
        <RequireRole allowedRoles={["administrador"]}>
            <PrestamosFeature />
        </RequireRole>
    );
}