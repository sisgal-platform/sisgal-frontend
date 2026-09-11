import { ArrowRight, FileText, Plus, Users, Wallet } from "lucide-react";
import { DashboardCard } from "../components/DashboardCard";
import { useSession } from "../session/useSession";
import { useNavigate } from 'react-router';

export function DashboardPage() {
    const { user } = useSession();
    const navigate = useNavigate();


    if (!user || user.rol !== "administrador") {
        return (
            <article className="w-full max-w-2xl rounded-2xl border border-error-light bg-white p-8 shadow-sm">
                <h1 className="mb-4 text-3xl font-bold text-primary">
                    Dashboard
                </h1>
                <p className="text-base text-text">
                    No tienes permisos para acceder al dashboard.
                </p>
            </article>
        );
    }

    const handleViewEmployees = () => {
        navigate("/personal");
    };

    const handleGeneratePayroll = () => {
        navigate("/nomina");
    };

    const handleRegisterLoan = () => {
        navigate("/novedades");
    };

    return (
        <main className="min-h-screen bg-secondary px-5 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Page header */}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">
                        Panel Administrativo
                    </h1>

                    <p className="mt-2 text-base text-primary-light">
                        Resumen general del sistema de gestión
                    </p>
                </header>

                {/* Dashboard cards */}
                <section
                    aria-label="Resumen administrativo"
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <DashboardCard
                        title="Empleados"
                        value={45}
                        label="activos"
                        icon={Users}
                        color="primary"
                        actionLabel="Ver todos"
                        actionIcon={ArrowRight}
                        onAction={handleViewEmployees}
                    />

                    <DashboardCard
                        title="Nómina"
                        value={3}
                        label="pendientes"
                        icon={Wallet}
                        color="success"
                        actionLabel="Generar"
                        actionIcon={Plus}
                        onAction={handleGeneratePayroll}
                    />

                    <DashboardCard
                        title="Novedades"
                        value={8}
                        label="activos"
                        icon={Wallet}
                        color="warning"
                        actionLabel="Registrar"
                        actionIcon={Plus}
                        onAction={handleRegisterLoan}
                    />

                    
                </section>
            </div>
        </main>
    );
}
