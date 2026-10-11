import { ArrowRight, FileText, Plus, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router";

import { DashboardCard } from "./DashboardCard";
import { useSession } from "@/session/hooks/useSession";
import { usePrestamosIndicadores } from "@/features/prestamos/hooks/usePrestamosIndicadores";
import { useDisabilityLeaveIndicators } from "@/features/incapacidades/hooks/useDisabilityLeaveIndicators";

function PrestamosDashboardCard({ onAction }: { onAction: () => void }) {
    const { indicadores, cargando, error } = usePrestamosIndicadores();

    return (
        <DashboardCard
            title="Préstamos"
            value={
                cargando
                    ? "..."
                    : error
                      ? "—"
                      : (indicadores?.cantidadPrestamosActivos ?? 0)
            }
            label={error ? "no disponibles" : "activos"}
            icon={Wallet}
            color="warning"
            actionLabel="Ver préstamos"
            actionIcon={ArrowRight}
            onAction={onAction}
        />
    );
}

function IncapacidadesDashboardCard({ onAction }: { onAction: () => void }) {
    const { indicators, loading, error } = useDisabilityLeaveIndicators();

    return (
        <DashboardCard
            title="Incapacidades"
            value={loading ? "..." : error ? "—" : (indicators?.activeCount ?? 0)}
            label={error ? "no disponibles" : "activas"}
            icon={FileText}
            color="text"
            actionLabel="Registrar"
            actionIcon={Plus}
            onAction={onAction}
        />
    );
}

export function DashboardContent() {
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

    const handleRegisterDisabilityLeave = () => {
        navigate("/incapacidades");
    };

    const handleViewLoans = () => {
        navigate("/prestamos");
    };

    return (
        <section className="space-y-6 p-4">
            <div className="mx-auto max-w-7xl 2xl:max-w-[1600px]">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                        Panel Administrativo
                    </h1>

                    <p className="mt-2 text-sm text-primary-light sm:text-base">
                        Resumen general del sistema de gestión
                    </p>
                </div>

                <section
                    aria-label="Resumen administrativo"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
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

                    <PrestamosDashboardCard onAction={handleViewLoans} />

                    <IncapacidadesDashboardCard onAction={handleRegisterDisabilityLeave} />
                </section>
            </div>
        </section>
    );
}
