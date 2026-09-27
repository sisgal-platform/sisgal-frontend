import type { User } from "@supabase/supabase-js";
import type { SessionUser } from "../../../session/types/session.types";

/** Convierte el User de Supabase al shape de sesión interno (nombre y rol). */
export function mapSupabaseUser(user: User): SessionUser {
    const metadata = user.user_metadata ?? {};

    // El nombre puede venir con distintas claves en user_metadata.
    const nombre =
        ([metadata["full_name"], metadata["fullName"], metadata["name"]].find(
            (value): value is string =>
                typeof value === "string" && value.length > 0,
        ) as string | undefined) ?? "";

    return {
        id: user.id,
        nombre,
        rol: mapRole(user.app_metadata?.role),
    };
}

/** El backend y Supabase usan el rol en mayúsculas (`ADMINISTRADOR`); la UI en minúsculas. */
function mapRole(role: unknown): SessionUser["rol"] {
    if (role === "ADMINISTRADOR") return "administrador";
    if (role === "SUPERVISOR") return "supervisor";
    return "empleado";
}
