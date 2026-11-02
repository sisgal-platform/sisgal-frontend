import { LoginForm } from "./LoginForm";

export function LoginContent() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm sm:p-8">
                <h1 className="mb-6 text-2xl font-bold text-primary">
                    Iniciar sesión
                </h1>

                <LoginForm />
            </div>
        </main>
    );
}