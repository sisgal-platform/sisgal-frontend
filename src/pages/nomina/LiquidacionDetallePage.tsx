import { ArrowLeft, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/atoms/SectionHeader";
import { PayrollPeriodDetail } from "@/features/liquidaciones/components/PayrollPeriodDetail";

export function LiquidacionDetallePage() {
    const navigate = useNavigate();
    const { payrollPeriodId } = useParams();
    const id = Number(payrollPeriodId);

    return (
        <section className="space-y-6 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => navigate("/nomina")}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Volver a liquidaciones
                    </button>
                    <SectionHeader
                        title="Detalle de la liquidación"
                        description="Información y conceptos del comprobante de pago."
                    />
                </div>

                {/* Exportación a PDF pendiente de otra historia (HU de exportación). */}
                <Button
                    type="button"
                    variant="outline"
                    disabled
                    title="Disponible próximamente"
                    className="flex items-center gap-2"
                >
                    <Download size={16} aria-hidden="true" />
                    Descargar PDF
                </Button>
            </div>

            {Number.isSafeInteger(id) && id > 0 ? (
                <PayrollPeriodDetail payrollPeriodId={id} />
            ) : (
                <p role="alert" className="text-sm text-error">
                    El identificador de la liquidación no es válido.
                </p>
            )}
        </section>
    );
}
