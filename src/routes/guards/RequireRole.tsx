import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";

import { useSession } from "@/session/hooks/useSession";
import type { SessionUser } from "@/session/types/session.types";

type RequireRoleProps = {
    children: ReactNode;
    allowedRoles?: Array<SessionUser["rol"]>;
};

export function RequireRole({
    children,
    allowedRoles = ["administrador"],
}: RequireRoleProps) {
    const { user } = useSession();
    const location = useLocation();

    if (!user || !allowedRoles.includes(user.rol)) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return <>{children}</>;
}
