import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthError, User } from "@supabase/supabase-js";
import { signInWithPassword } from "../services/auth/auth.service";
import { EMPTY_SESSION } from "../session/types/session.types";
import { renderApp } from "../test/render";

const usuario: User = {
    id: "u-1",
    user_metadata: { full_name: "María González" },
    app_metadata: { role: "ADMINISTRADOR" },
} as unknown as User;

const errorCredenciales: AuthError = {
    name: "AuthApiError",
    message: "Invalid login credentials",
    status: 400,
} as AuthError;

const errorRateLimit: AuthError = {
    name: "AuthApiError",
    message: "Request rate limit reached",
    status: 429,
} as AuthError;

afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
});

describe("Autenticación", () => {
    it("inicia sesión con credenciales válidas y accede al dashboard", async () => {
        vi.mocked(signInWithPassword).mockResolvedValue({
            user: usuario,
            error: null,
        });
        const { user } = renderApp({ ruta: "/login", sesion: EMPTY_SESSION });

        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "maria@example.com",
        );
        await user.type(screen.getByLabelText("Contraseña"), "secret123");
        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(
            await screen.findByRole("heading", {
                name: "Dashboard",
            }),
        ).toBeInTheDocument();
        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Inicio de sesión exitoso.",
        );
    });

    it("muestra un mensaje genérico ante credenciales inválidas", async () => {
        vi.mocked(signInWithPassword).mockResolvedValue({
            user: null,
            error: errorCredenciales,
        });
        const { user } = renderApp({ ruta: "/login", sesion: EMPTY_SESSION });

        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "maria@example.com",
        );
        await user.type(screen.getByLabelText("Contraseña"), "incorrecta1");
        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Credenciales incorrectas.",
        );
    });

    it("informa demasiados intentos ante rate limit (429)", async () => {
        vi.mocked(signInWithPassword).mockResolvedValue({
            user: null,
            error: errorRateLimit,
        });
        const { user } = renderApp({ ruta: "/login", sesion: EMPTY_SESSION });

        await user.type(
            screen.getByLabelText("Correo electrónico"),
            "maria@example.com",
        );
        await user.type(screen.getByLabelText("Contraseña"), "secret123");
        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
        );
    });

    it("notifica cuando faltan campos obligatorios", async () => {
        const { user } = renderApp({ ruta: "/login", sesion: EMPTY_SESSION });

        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Completa todos los campos.",
        );
    });

    it("redirige a login cuando no hay sesión (ruta protegida)", async () => {
        renderApp({ ruta: "/", sesion: EMPTY_SESSION });

        expect(
            await screen.findByRole("heading", {
                level: 1,
                name: /iniciar sesión/i,
            }),
        ).toBeInTheDocument();
    });
});
