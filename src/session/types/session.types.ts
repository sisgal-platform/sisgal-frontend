import type { ModuleId } from "../../config/modules.catalog";

export type SessionUser = {
    id: string;
    nombre: string;
    rol: "administrador" | "supervisor" | "empleado";
};

export type SessionState = {
    user: SessionUser | null;
    /** Último módulo visitado; se conserva al navegar y al recargar. */
    lastModule: ModuleId | null;
    /** Momento en que se abrió la sesión (ISO 8601). */
    startedAt: string | null;
};

export type SessionContextValue = SessionState & {
    isAuthenticated: boolean;
    login: (user: SessionUser) => void;
    logout: () => void;
    setLastModule: (moduleId: ModuleId) => void;
};

export const EMPTY_SESSION: SessionState = {
    user: null,
    lastModule: null,
    startedAt: null,
};
