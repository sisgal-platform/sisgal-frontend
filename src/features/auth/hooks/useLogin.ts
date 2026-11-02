import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { AuthError } from "@supabase/supabase-js";

import { useSession } from "@/session/hooks/useSession";
import { useToast } from "@/toast/hooks/useToast";
import { signInWithPassword } from "@/services/auth/auth.service";
import { mapSupabaseUser } from "@/services/auth/mappers/user.mapper";

function mensajeDeError(error: AuthError | null): string {
    if (!error) {
        return "Ocurrió un error. Inténtalo de nuevo.";
    }
    if (error.status === 429 || /rate limit/i.test(error.message)) {
        return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    }
    return "Credenciales incorrectas.";
}

export function useLogin() {
    const { login } = useSession();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [enviando, setEnviando] = useState(false);

    async function loginUser(email: string, password: string) {
        if (!email.trim() || !password) {
            showToast("Completa todos los campos.", "warning");
            return;
        }

        setEnviando(true);

        try {
            const { user, error } = await signInWithPassword(email, password);

            if (error || !user) {
                showToast(mensajeDeError(error), "error");
                return;
            }

            login(mapSupabaseUser(user));

            showToast("Inicio de sesión exitoso.", "success");

            const from = (
                location.state as { from?: { pathname?: string } } | null
            )?.from?.pathname;

            navigate(from ?? "/", { replace: true });
        } catch {
            showToast("Ocurrió un error. Inténtalo de nuevo.", "error");
        } finally {
            setEnviando(false);
        }
    }

    return { loginUser, enviando };
}
