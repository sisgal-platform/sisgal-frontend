import { useState, type FormEvent } from "react";

import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { loginUser, enviando } = useLogin();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!email.trim() || !password) {
            return;
        }

        await loginUser(email, password);
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
        >
            <label className="flex flex-col gap-1 text-sm text-text-muted">
                Correo electrónico
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    disabled={enviando}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm text-text-muted">
                Contraseña
                <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    disabled={enviando}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
            </label>

            <button
                type="submit"
                disabled={enviando}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
                {enviando ? "Ingresando…" : "Ingresar"}
            </button>
        </form>
    );
}
