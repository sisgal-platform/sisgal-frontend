import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import { SectionHeader } from "@/components/atoms/SectionHeader";
import { Combobox } from "@/components/ui/combobox";
import { EmployeeCombobox } from "@/features/empleados/components/EmployeeCombobox";
import { useToast } from "@/toast";

import { EmployeeFormModal } from "./components/EmployeeFormModal";
import { EmployeeEditModal } from "./components/EmployeeEditModal";
import { DeactivateEmployeeDialog } from "./components/DeactivateEmployeeDialog";
import { EmployeeTable } from "./components/EmployeeTable";
import { useEmployees } from "./hooks/useEmployees";
import { useActiveBranches } from "./hooks/useActiveBranches";
import { useActivePositions } from "./hooks/useActivePositions";
import { employeesService } from "./services/employeesService";
import type { Employee } from "./interfaces/types";

type EstadoFiltro = "ACTIVO" | "INACTIVO" | undefined;

const EMPLEADOS_POR_PAGINA = 10;

export function EmpleadosFeature() {
    const { showToast } = useToast();
    const [employeeIdFilter, setEmployeeIdFilter] = useState("");
    const [branchId, setBranchId] = useState<number | undefined>(undefined);
    const [positionId, setPositionId] = useState<number | undefined>(undefined);
    const [status, setStatus] = useState<EstadoFiltro>(undefined);
    const [pagina, setPagina] = useState(1);
    const [empleadoEditando, setEmpleadoEditando] = useState<Employee | null>(
        null,
    );
    const [empleadoADesactivar, setEmpleadoADesactivar] =
        useState<Employee | null>(null);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);

    // Cualquier cambio en los filtros vuelve a la primera página
    useEffect(() => {
        setPagina(1);
    }, [employeeIdFilter, branchId, positionId, status]);

    const {
        employees: employeesFetched,
        cargando,
        error,
        recargar,
    } = useEmployees({
        branchId,
        positionId,
        status,
    });
    const { branches } = useActiveBranches();
    const { positions } = useActivePositions();
    const branchOptions = branches.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }));
    const positionOptions = positions.map((position) => ({
        value: String(position.id),
        label: position.name,
    }));

    // El backend no tiene filtro de empleado; la selección se aplica en cliente.
    const employees = employeesFetched.filter(
        (employee) =>
            !employeeIdFilter || String(employee.id) === employeeIdFilter,
    );

    const limpiarFiltros = () => {
        setEmployeeIdFilter("");
        setBranchId(undefined);
        setPositionId(undefined);
        setStatus(undefined);
    };

    const handleDesactivarRequest = (employee: Employee) => {
        setEmpleadoADesactivar(employee);
        setIsDeactivateDialogOpen(true);
    };

    const handleDesactivarConfirm = async (id: number) => {
        await employeesService.deactivate(id);

        await recargar();

        showToast("Empleado desactivado correctamente.", "success");

        setIsDeactivateDialogOpen(false);
        setEmpleadoADesactivar(null);
    };

    const totalPaginas = Math.max(
        1,
        Math.ceil(employees.length / EMPLEADOS_POR_PAGINA),
    );
    const inicio = (pagina - 1) * EMPLEADOS_POR_PAGINA;
    const empleadosPagina = employees.slice(
        inicio,
        inicio + EMPLEADOS_POR_PAGINA,
    );

    return (
        <section className="space-y-6 p-4">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    eyebrow="Personal"
                    title="Empleados"
                    description="Gestión de empleados del restaurante."
                />

                <EmployeeFormModal onSuccess={recargar} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex flex-col gap-1 text-sm text-text-muted">
                    <span>Empleado</span>
                    <EmployeeCombobox
                        employees={employeesFetched}
                        value={employeeIdFilter}
                        onChange={setEmployeeIdFilter}
                        loading={cargando}
                        disabled={cargando}
                        placeholder="Buscar nombre o documento"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-text-muted">
                    Sucursal
                    <Combobox
                        options={branchOptions}
                        allLabel="Todas"
                        value={branchId !== undefined ? String(branchId) : ""}
                        onChange={(value) =>
                            setBranchId(value ? Number(value) : undefined)
                        }
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-text-muted">
                    Cargo
                    <Combobox
                        options={positionOptions}
                        value={
                            positionId !== undefined ? String(positionId) : ""
                        }
                        onChange={(value) =>
                            setPositionId(value ? Number(value) : undefined)
                        }
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-text-muted">
                    Estado
                    <select
                        value={status ?? ""}
                        onChange={(event) =>
                            setStatus(
                                event.target.value
                                    ? (event.target.value as EstadoFiltro)
                                    : undefined,
                            )
                        }
                        className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                    >
                        <option value="">Todos</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                    </select>
                </label>

                <button
                    type="button"
                    onClick={limpiarFiltros}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text transition hover:bg-secondary"
                >
                    <RotateCcw size={16} aria-hidden="true" />
                    Limpiar filtros
                </button>
            </div>

            <EmployeeTable
                employees={empleadosPagina}
                cargando={cargando}
                error={error}
                onReintentar={recargar}
                onVerDetalle={setEmpleadoEditando}
                onDesactivar={handleDesactivarRequest}
            />

            <EmployeeEditModal
                employee={empleadoEditando}
                onOpenChange={(open) => {
                    if (!open) setEmpleadoEditando(null);
                }}
                onSuccess={recargar}
            />

            <DeactivateEmployeeDialog
                employee={empleadoADesactivar}
                open={isDeactivateDialogOpen}
                onOpenChange={(nextOpen) => {
                    setIsDeactivateDialogOpen(nextOpen);

                    if (!nextOpen) {
                        setEmpleadoADesactivar(null);
                    }
                }}
                onConfirm={handleDesactivarConfirm}
            />

            {employees.length > EMPLEADOS_POR_PAGINA && (
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>
                        Página {pagina} de {totalPaginas}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={pagina <= 1}
                            onClick={() => setPagina((actual) => actual - 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            disabled={pagina >= totalPaginas}
                            onClick={() => setPagina((actual) => actual + 1)}
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
