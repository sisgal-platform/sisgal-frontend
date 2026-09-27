import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";
import type { ToastContextValue } from "../types/toast.types";

export function useToast(): ToastContextValue {
    const value = useContext(ToastContext);
    if (value === null) {
        throw new Error("useToast debe usarse dentro de un <ToastProvider>");
    }
    return value;
}
