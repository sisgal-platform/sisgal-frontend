import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, CalendarDays, RotateCcw, Search } from "lucide-react";

import { SectionHeader } from "@/components/atoms/SectionHeader";
import { Combobox } from "@/components/ui/combobox";
import { EmployeeCombobox } from "@/features/empleados/components/EmployeeCombobox";
import { formatNumberCO } from "@/lib/formatters";
import { useActivePositions } from "@/features/empleados/hooks/useActivePositions";

import { DisabilityLeaveIndicatorCard } from "./components/DisabilityLeaveIndicatorCard";
import { DisabilityLeaveTable } from "./components/DisabilityLeaveTable";
import { RegisterDisabilityLeaveModal } from "./components/RegisterDisabilityLeaveModal";
import { useActiveEmployees } from "./hooks/useActiveEmployees";
import { useDisabilityLeaves } from "./hooks/useDisabilityLeaves";
import type {
    DisabilityLeave,
    DisabilityLeaveFilterValues,
    DisabilityLeaveIndicators,
    DisabilityLeaveQuery,
} from "./interfaces/types";

const indicatorsConfig = [
    {
        title: "Incapacidades activas",
        Icon: Activity,
        iconStyle: "bg-warning-light text-warning",
        getValue: ({ activeCount }: DisabilityLeaveIndicators) =>
            formatNumberCO(activeCount),
    },
    {
        title: "Total días activos",
        Icon: CalendarDays,
        iconStyle: "bg-error-light text-error",
        getValue: ({ totalActiveDays }: DisabilityLeaveIndicators) =>
            formatNumberCO(totalActiveDays),
    },
] as const;

const PAGE_SIZE = 10;

// Los indicadores se calculan sobre el mismo listado filtrado que se muestra en la tabla
function calculateIndicators(
    disabilityLeaves: DisabilityLeave[],
): DisabilityLeaveIndicators {
    const active = disabilityLeaves.filter((item) => item.status === "Activo");

    return {
        activeCount: active.length,
        totalActiveDays: active.reduce((sum, item) => sum + item.totalDays, 0),
    };
}

const emptyFilters: DisabilityLeaveFilterValues = {
    employeeId: "",
    positionId: "",
    status: "",
    startDate: "",
    endDate: "",
};

// Arma el query que se le manda al backend a partir de los filtros (strings) del formulario
function buildQuery(
    filters: DisabilityLeaveFilterValues,
): DisabilityLeaveQuery {
    const query: DisabilityLeaveQuery = {};

    if (filters.employeeId) query.employeeId = Number(filters.employeeId);
    if (filters.positionId) query.positionId = Number(filters.positionId);
    if (filters.status) query.status = filters.status;
    if (filters.startDate) query.startDate = filters.startDate;
    if (filters.endDate) query.endDate = filters.endDate;

    return query;
}

export function IncapacidadesFeature() {
    const [filters, setFilters] = useState(emptyFilters);
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
    const [dateRangeError, setDateRangeError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const { disabilityLeaves, loading, error, reload } = useDisabilityLeaves(
        buildQuery(appliedFilters),
    );
    const { positions, cargando: positionsLoading } = useActivePositions();
    const positionOptions = positions.map((position) => ({
        value: String(position.id),
        label: position.name,
    }));
    const { employees, loading: employeesLoading } = useActiveEmployees();

    // Cualquier cambio en los filtros aplicados vuelve a la primera página
    useEffect(() => {
        setPage(1);
    }, [appliedFilters]);

    const indicatorsData = useMemo(
        () => calculateIndicators(disabilityLeaves),
        [disabilityLeaves],
    );

    const totalPages = Math.max(
        1,
        Math.ceil(disabilityLeaves.length / PAGE_SIZE),
    );
    const pageStart = (page - 1) * PAGE_SIZE;
    const pageItems = disabilityLeaves.slice(pageStart, pageStart + PAGE_SIZE);

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // La fecha inicial no puede ser posterior a la final; se bloquea la consulta
        if (
            filters.startDate &&
            filters.endDate &&
            filters.startDate > filters.endDate
        ) {
            setDateRangeError(
                "La fecha inicial no puede ser posterior a la fecha final.",
            );
            return;
        }

        setDateRangeError(null);
        setAppliedFilters(filters);
    }

    function clearFilters() {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setDateRangeError(null);
    }

    return (
        <section className="space-y-6 p-4">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    eyebrow="Gestión"
                    title="Incapacidades"
                    description="Registro de incapacidades y licencias de los empleados."
                />

                <RegisterDisabilityLeaveModal onSuccess={reload} />
            </div>

            <section
                aria-label="Resumen de incapacidades"
                aria-busy={loading}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
                {indicatorsConfig.map(
                    ({ title, Icon, iconStyle, getValue }) => (
                        <DisabilityLeaveIndicatorCard
                            key={title}
                            title={title}
                            value={loading ? "..." : getValue(indicatorsData)}
                            Icon={Icon}
                            iconStyle={iconStyle}
                        />
                    ),
                )}
            </section>

            <form
                onSubmit={applyFilters}
                className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm"
            >
                <div className="flex flex-wrap gap-4">
                    <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm text-text-muted">
                        <span>Empleado</span>
                        <EmployeeCombobox
                            employees={employees}
                            loading={employeesLoading}
                            disabled={employeesLoading}
                            value={filters.employeeId}
                            onChange={(employeeId) =>
                                setFilters({ ...filters, employeeId })
                            }
                            placeholder="Buscar nombre o documento"
                        />
                    </label>

                    <label className="flex w-48 flex-col gap-1 text-sm text-text-muted">
                        Cargo
                        <Combobox
                            options={positionOptions}
                            loading={positionsLoading}
                            value={filters.positionId}
                            onChange={(positionId) =>
                                setFilters({ ...filters, positionId })
                            }
                        />
                    </label>

                    <label className="flex w-36 flex-col gap-1 text-sm text-text-muted">
                        Estado
                        <select
                            value={filters.status}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    status: event.target
                                        .value as DisabilityLeaveFilterValues["status"],
                                })
                            }
                            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                        >
                            <option value="">Todos</option>
                            <option value="Activo">Activo</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </label>

                    <label className="flex w-40 flex-col gap-1 text-sm text-text-muted">
                        Fecha desde
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    startDate: event.target.value,
                                })
                            }
                            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                        />
                    </label>

                    <label className="flex w-40 flex-col gap-1 text-sm text-text-muted">
                        Fecha hasta
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    endDate: event.target.value,
                                })
                            }
                            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                        />
                    </label>
                </div>

                {dateRangeError && (
                    <p role="alert" className="text-sm text-error">
                        {dateRangeError}
                    </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text transition hover:bg-secondary"
                    >
                        <RotateCcw size={16} aria-hidden="true" />
                        Limpiar filtros
                    </button>
                    <button
                        type="submit"
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                        <Search size={16} aria-hidden="true" />
                        Aplicar filtros
                    </button>
                </div>
            </form>

            <DisabilityLeaveTable
                disabilityLeaves={pageItems}
                loading={loading}
                error={error}
                onRetry={reload}
            />

            {disabilityLeaves.length > PAGE_SIZE && (
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>
                        Página {page} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => current - 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((current) => current + 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
