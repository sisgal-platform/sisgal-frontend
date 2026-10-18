import { useEffect, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { Modal } from "@/components/molecules/Modal";
import { EmployeeCombobox } from "@/features/empleados/components/EmployeeCombobox";
import { employeesService } from "@/features/empleados/services/employeesService";
import type { Employee } from "@/features/empleados/interfaces/types";
import { useToast } from "@/toast/hooks/useToast";

import { prestamosService } from "../services/prestamosService";

type CreatePrestamoModalProps = {
    onSuccess: () => void;
};

type Errores = {
    employeeId?: string;
    totalAmount?: string;
    totalInstallments?: string;
    grantedAt?: string;
};

export function CreatePrestamoModal({ onSuccess }: CreatePrestamoModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
            >
                <Plus size={18} aria-hidden="true" />
                Crear préstamo
            </button>
            {open && (
                <CreatePrestamoDialog
                    onClose={() => setOpen(false)}
                    onSuccess={() => {
                        setOpen(false);
                        onSuccess();
                    }}
                />
            )}
        </>
    );
}

type CreatePrestamoDialogProps = {
    onClose: () => void;
    onSuccess: () => void;
};

function CreatePrestamoDialog({
    onClose,
    onSuccess,
}: CreatePrestamoDialogProps) {
    const { showToast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [employeesError, setEmployeesError] = useState<string | null>(null);
    const [loadVersion, setLoadVersion] = useState(0);
    const [employeeId, setEmployeeId] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [totalInstallments, setTotalInstallments] = useState("");
    const [grantedAt, setGrantedAt] = useState("");
    const [errors, setErrors] = useState<Errores>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadEmployees() {
            setLoadingEmployees(true);
            setEmployeesError(null);

            try {
                const result = await employeesService.list({
                    status: "ACTIVO",
                });
                if (active) {
                    setEmployees(
                        result.filter(
                            (employee) => employee.status === "ACTIVO",
                        ),
                    );
                }
            } catch {
                if (active) {
                    setEmployeesError(
                        "No fue posible cargar los empleados activos.",
                    );
                }
            } finally {
                if (active) setLoadingEmployees(false);
            }
        }

        void loadEmployees();
        return () => {
            active = false;
        };
    }, [loadVersion]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nextErrors: Errores = {};
        const amount = Number(totalAmount);
        const installments = Number(totalInstallments);

        if (!employeeId) nextErrors.employeeId = "Selecciona un empleado.";
        if (!Number.isFinite(amount) || amount <= 0) {
            nextErrors.totalAmount =
                "El valor del préstamo debe ser mayor que cero.";
        }
        if (!Number.isInteger(installments) || installments < 1) {
            nextErrors.totalInstallments = "Ingresa un total de cuotas válido.";
        }
        if (!grantedAt)
            nextErrors.grantedAt = "Selecciona la fecha de entrega.";

        setErrors(nextErrors);
        setSubmitError(null);
        if (Object.keys(nextErrors).length > 0) return;

        setSubmitting(true);
        try {
            await prestamosService.crear({
                employeeId: Number(employeeId),
                totalAmount: amount,
                totalInstallments: installments,
                grantedAt,
            });
            showToast("Préstamo creado correctamente.", "success");
            onSuccess();
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "No fue posible crear el préstamo.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    const busy = submitting || loadingEmployees;
    let employeePlaceholder = "Buscar nombre o documento";
    if (loadingEmployees) employeePlaceholder = "Cargando empleados…";
    else if (employees.length === 0)
        employeePlaceholder = "No hay empleados activos";

    return (
        <Modal title="Crear préstamo" onClose={submitting ? () => {} : onClose}>
            <form
                noValidate
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="prestamo-empleado"
                        className="text-sm font-semibold text-text"
                    >
                        Empleado{" "}
                        <span aria-hidden="true" className="text-error">
                            *
                        </span>
                    </label>
                    <EmployeeCombobox
                        id="prestamo-empleado"
                        employees={employees}
                        value={employeeId}
                        onChange={setEmployeeId}
                        disabled={busy || employees.length === 0}
                        loading={loadingEmployees}
                        placeholder={employeePlaceholder}
                        allLabel="Selecciona un empleado"
                        aria-invalid={errors.employeeId ? true : undefined}
                        aria-describedby={
                            errors.employeeId
                                ? "prestamo-empleado-error"
                                : undefined
                        }
                    />
                    {errors.employeeId && (
                        <p
                            id="prestamo-empleado-error"
                            className="text-sm text-error"
                        >
                            {errors.employeeId}
                        </p>
                    )}
                </div>

                {employeesError && (
                    <div
                        role="alert"
                        className="flex items-center justify-between gap-3 text-sm text-error"
                    >
                        <span>{employeesError}</span>
                        <button
                            type="button"
                            onClick={() =>
                                setLoadVersion((version) => version + 1)
                            }
                            className="font-semibold underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}
                {!loadingEmployees &&
                    !employeesError &&
                    employees.length === 0 && (
                        <p className="text-sm text-text-muted">
                            Registra un empleado activo antes de crear un
                            préstamo.
                        </p>
                    )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="prestamo-valor"
                            className="text-sm font-semibold text-text"
                        >
                            Valor del préstamo{" "}
                            <span aria-hidden="true" className="text-error">
                                *
                            </span>
                        </label>
                        <input
                            id="prestamo-valor"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={totalAmount}
                            onChange={(event) =>
                                setTotalAmount(event.target.value)
                            }
                            disabled={submitting}
                            aria-invalid={errors.totalAmount ? true : undefined}
                            aria-describedby={
                                errors.totalAmount
                                    ? "prestamo-valor-error"
                                    : undefined
                            }
                            className="h-11 rounded-xl border border-gray-300 px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid]:border-error"
                        />
                        {errors.totalAmount && (
                            <p
                                id="prestamo-valor-error"
                                className="text-sm text-error"
                            >
                                {errors.totalAmount}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="prestamo-cuotas"
                            className="text-sm font-semibold text-text"
                        >
                            Total de cuotas{" "}
                            <span aria-hidden="true" className="text-error">
                                *
                            </span>
                        </label>
                        <input
                            id="prestamo-cuotas"
                            type="number"
                            min="1"
                            step="1"
                            value={totalInstallments}
                            onChange={(event) =>
                                setTotalInstallments(event.target.value)
                            }
                            disabled={submitting}
                            aria-invalid={
                                errors.totalInstallments ? true : undefined
                            }
                            aria-describedby={
                                errors.totalInstallments
                                    ? "prestamo-cuotas-error"
                                    : undefined
                            }
                            className="h-11 rounded-xl border border-gray-300 px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid]:border-error"
                        />
                        {errors.totalInstallments && (
                            <p
                                id="prestamo-cuotas-error"
                                className="text-sm text-error"
                            >
                                {errors.totalInstallments}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="prestamo-fecha-entrega"
                        className="text-sm font-semibold text-text"
                    >
                        Fecha de entrega{" "}
                        <span aria-hidden="true" className="text-error">
                            *
                        </span>
                    </label>
                    <input
                        id="prestamo-fecha-entrega"
                        type="date"
                        value={grantedAt}
                        onChange={(event) => setGrantedAt(event.target.value)}
                        disabled={submitting}
                        aria-invalid={errors.grantedAt ? true : undefined}
                        aria-describedby={
                            errors.grantedAt
                                ? "prestamo-fecha-error"
                                : undefined
                        }
                        className="h-11 rounded-xl border border-gray-300 px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid]:border-error"
                    />
                    {errors.grantedAt && (
                        <p
                            id="prestamo-fecha-error"
                            className="text-sm text-error"
                        >
                            {errors.grantedAt}
                        </p>
                    )}
                </div>

                {submitError && (
                    <p
                        role="alert"
                        className="rounded-xl bg-error-light px-3 py-2 text-sm text-error"
                    >
                        {submitError}
                    </p>
                )}

                <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text hover:bg-secondary disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={
                            busy ||
                            employees.length === 0 ||
                            Boolean(employeesError)
                        }
                        className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting ? "Guardando…" : "Crear préstamo"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
