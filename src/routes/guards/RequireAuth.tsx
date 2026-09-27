import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../../session/hooks/useSession";

/** Guard de sesión: redirige a /login si no hay un usuario autenticado. */
export function RequireAuth() {
    const { isAuthenticated } = useSession();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
