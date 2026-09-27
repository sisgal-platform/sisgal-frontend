import { RequireRole } from "../../routes/guards/RequireRole";
import { ConfiguracionFeature } from "../../features/configuracion";

export function ConfiguracionPage() {
    return (
        <RequireRole allowedRoles={["administrador"]}>
            <ConfiguracionFeature />
        </RequireRole>
    );
}
