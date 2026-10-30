import { createContext } from "react";
import type { ToastContextValue } from "../types/toast.types";

/**
 * Vive en su propio módulo (sin componentes) para no romper el fast refresh
 * de react-refresh, que exige que un archivo exporte solo componentes.
 */
export const ToastContext = createContext<ToastContextValue | null>(null);
