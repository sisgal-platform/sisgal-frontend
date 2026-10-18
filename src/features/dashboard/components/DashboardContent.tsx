import { ArrowRight, FileText, Plus, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router";

import { DashboardCard } from "./DashboardCard";
import { DashboardIndicatorsSection } from "./DashboardIndicatorsSection";
import { useSession } from "@/session/hooks/useSession";
import { usePrestamosIndicadores } from "@/features/prestamos/hooks/usePrestamosIndicadores";
import { useDisabilityLeaveIndicators } from "@/features/incapacidades/hooks/useDisabilityLeaveIndicators";
import { useActiveEmployeesCount } from "../hooks/useActiveEmployeesCount";
import { SectionHeader } from "@/components/atoms";

function EmployeesDashboardCard({ onAction }: { onAction: () => void }) {
    const { count, loading, error } = useActiveEmployeesCount();

    return (
        <DashboardCard
            title="Empleados"
            value={loading ? "..." : error ? "—" : (count ?? 0)}
            label={error ? "no disponibles" : "activos"}
            icon={Users}
            color="primary"
            actionLabel="Ver todos"
            actionIcon={ArrowRight}
            onAction={onAction}
        />
    );
}

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
            value={
                loading ? "..." : error ? "—" : (indicators?.activeCount ?? 0)
            }
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
                <div className="flex items-start justify-between gap-4">
                    <SectionHeader
                        eyebrow="Gestión"
                        title="Dashboard"
                        description="Resumen general del sistema de gestión"
                    />
                </div>

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
                <div className="flex items-start justify-between gap-4 mb-4">
                    <SectionHeader
                        eyebrow="Gestión"
                        title="Dashboard"
                        description="Resumen general del sistema de gestión"
                    />
                </div>

                <section
                    aria-label="Resumen administrativo"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
                >
                    <EmployeesDashboardCard onAction={handleViewEmployees} />

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

                    <IncapacidadesDashboardCard
                        onAction={handleRegisterDisabilityLeave}
                    />
                </section>

                <DashboardIndicatorsSection />
            </div>
        </section>
    );
}
