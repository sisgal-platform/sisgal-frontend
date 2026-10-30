import { LiquidacionesFeature } from "@/features/liquidaciones";
import { RequireRole } from "@/routes/guards/RequireRole";

export function NominaPage() {
    return (
        <RequireRole allowedRoles={["administrador"]}>
            <LiquidacionesFeature />
        </RequireRole>
    );
}
