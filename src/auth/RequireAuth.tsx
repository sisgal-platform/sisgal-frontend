import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../session/useSession";




export function RequireAuth() {
    const {isAuthenticated} = useSession()
    const location = useLocation()


    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }

    return <Outlet />
} 