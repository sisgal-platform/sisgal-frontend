import { useEffect } from "react";

import { useSession } from "../../../session/hooks/useSession";

import { supabase } from "../../../services/auth/auth.service";
import { mapSupabaseUser } from "../../../services/auth/mappers/user.mapper";

import {
    writeAccessToken,
    clearAccessToken,
} from "../../../services/auth/auth.token.storage";

/**
 * Puente entre Supabase y la sesión de React:
 * rehidrata la sesión al arrancar y la mantiene sincronizada
 * ante login, logout y refresco de token.
 */
export function AuthSync() {
    const { login, logout } = useSession();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) {
                login(mapSupabaseUser(data.session.user));

                if (data.session.access_token) {
                    writeAccessToken(data.session.access_token);
                }
            } else {
                clearAccessToken();
                logout();
            }
        });

        const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                login(mapSupabaseUser(session.user));

                if (session.access_token) {
                    writeAccessToken(session.access_token);
                }
            } else {
                clearAccessToken();
                logout();
            }
        });

        return () => data.subscription.unsubscribe();
    }, [login, logout]);

    return null;
}
