import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters";

import { obtenerConfiguracionEstadoPrestamo } from "../estadosPrestamo";
import { obtenerEtiquetaPeriodicidadPrestamo } from "../periodicidadesPrestamo";
import type { Prestamo } from "../interfaces/types";
import { prestamosService } from "../services/prestamosService";

type PrestamoDetailDialogProps = {
    prestamo: Prestamo;
    onOpenChange: (open: boolean) => void;
};

type ResultadoDetalle = {
    prestamoId: number;
    intento: number;
    detalle?: Prestamo;
    error?: string;
};

export function PrestamoDetailDialog({
    prestamo,
    onOpenChange,
}: PrestamoDetailDialogProps) {
    const [intento, setIntento] = useState(0);
    const [resultado, setResultado] = useState<ResultadoDetalle | null>(null);

    useEffect(() => {
        let activo = true;

        prestamosService.obtenerPorId(prestamo.id).then(
            (resultado) => {
                if (activo) {
                    setResultado({
                        prestamoId: prestamo.id,
                        intento,
                        detalle: resultado,
                    });
                }
            },
            (error: unknown) => {
                if (activo) {
                    setResultado({
                        prestamoId: prestamo.id,
                        intento,
                        error:
                            error instanceof Error
                                ? error.message
                                : "No fue posible cargar el detalle del préstamo.",
                    });
                }
            },
        );

        return () => {
            activo = false;
        };
    }, [prestamo.id, intento]);

    const resultadoActual =
        resultado?.prestamoId === prestamo.id && resultado.intento === intento
            ? resultado
            : null;
    const detalle = resultadoActual?.detalle ?? null;
    const error = resultadoActual?.error ?? null;
    const cargando = resultadoActual === null;

    const estado = detalle
        ? obtenerConfiguracionEstadoPrestamo(detalle.status)
        : null;

    return (
        <Dialog open={true} onOpenChange={(open) => onOpenChange(open)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle del préstamo #{prestamo.id}</DialogTitle>
                </DialogHeader>

                {cargando && (
                    <p role="status" className="py-6 text-sm text-text-muted">
                        Cargando detalle del préstamo…
                    </p>
                )}

                {error && (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-error-light px-4 py-3 text-sm text-error"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setIntento((actual) => actual + 1)}
                            className="font-semibold underline underline-offset-2"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {detalle && !cargando && (
                    <div className="space-y-5">
                        <section aria-labelledby="prestamo-detalle-empleado">
                            <h3
                                id="prestamo-detalle-empleado"
                                className="mb-3 text-sm font-semibold text-primary"
                            >
                                Empleado
                            </h3>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                                <Dato label="Nombre">
                                    {detalle.employee.firstName}{" "}
                                    {detalle.employee.lastName}
                                </Dato>
                                <Dato label="Documento">
                                    {detalle.employee.documentType
                                        ? `${detalle.employee.documentType} ${detalle.employee.document}`
                                        : detalle.employee.document}
                                </Dato>
                            </dl>
                        </section>

                        <section aria-labelledby="prestamo-detalle-condiciones">
                            <h3
                                id="prestamo-detalle-condiciones"
                                className="mb-3 text-sm font-semibold text-primary"
                            >
                                Condiciones del préstamo
                            </h3>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                                <Dato label="Estado">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado?.badgeClassName}`}
                                    >
                                        {estado?.label}
                                    </span>
                                </Dato>
                                <Dato label="Monto total">
                                    {formatCurrencyCOP(detalle.totalAmount)}
                                </Dato>
                                <Dato label="Valor de cada cuota">
                                    {formatCurrencyCOP(
                                        detalle.installmentAmount,
                                    )}
                                </Dato>
                                <Dato label="Total de cuotas">
                                    {detalle.totalInstallments}
                                </Dato>
                                <Dato label="Periodicidad del descuento">
                                    {obtenerEtiquetaPeriodicidadPrestamo(
                                        detalle.periodicity,
                                    )}
                                </Dato>
                                <Dato label="Cuotas pendientes">
                                    {detalle.pendingInstallments}
                                </Dato>
                                <Dato label="Saldo pendiente">
                                    {formatCurrencyCOP(
                                        detalle.outstandingBalance,
                                    )}
                                </Dato>
                                <Dato label="Fecha de otorgamiento">
                                    {formatDateCO(detalle.grantedAt)}
                                </Dato>
                                <Dato label="Fecha de creación">
                                    {formatDateCO(detalle.createdAt)}
                                </Dato>
                                <Dato label="Última actualización">
                                    {formatDateCO(detalle.updatedAt)}
                                </Dato>
                            </dl>
                        </section>
                    </div>
                )}

                <DialogFooter>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                        Cerrar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Dato({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="break-words text-sm font-medium text-text">
                {children}
            </dd>
        </div>
    );
}
