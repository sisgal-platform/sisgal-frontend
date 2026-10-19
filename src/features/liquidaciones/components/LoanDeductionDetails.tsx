import { formatCurrencyCOP, formatNumberCO } from "@/lib/formatters"

import type { PayrollLine, PayrollLineLoan } from "../interfaces/types"

type LoanDeductionInfoProps = Readonly<{
    amount: number
    loan: PayrollLineLoan
}>

/** Préstamo al que corresponde una cuota descontada y cómo queda después del descuento. */
export function LoanDeductionInfo({ amount, loan }: LoanDeductionInfoProps) {
    const esParcial = amount < loan.scheduledAmount

    return (
        <span className="mt-0.5 block text-xs font-normal text-text-muted">
            Préstamo #{loan.loanId}
            {loan.installments > 1 && ` · ${formatNumberCO(loan.installments)} cuotas`}
            {" · "}Saldo restante: {formatCurrencyCOP(loan.outstandingBalance)}
            {" · "}Cuotas pendientes: {formatNumberCO(loan.pendingInstallments)}
            {esParcial && (
                <span className="block text-warning-dark">
                    Descuento parcial: correspondían {formatCurrencyCOP(loan.scheduledAmount)}
                </span>
            )}
        </span>
    )
}

/** Nombre del concepto y, si es una cuota de préstamo, el préstamo al que corresponde. */
export function ConceptName({ line }: Readonly<{ line: PayrollLine }>) {
    return (
        <>
            {line.conceptName}
            {line.loan && <LoanDeductionInfo amount={line.amount} loan={line.loan} />}
        </>
    )
}

/** Cuotas de préstamos que no se descontaron completas, con el motivo. */
export function LoanObservations({
    observations,
}: Readonly<{ observations: string[] | undefined }>) {
    if (!observations || observations.length === 0) return null

    return (
        <section
            aria-label="Observaciones de préstamos"
            className="rounded-lg bg-warning-light px-4 py-3 text-sm text-warning-dark"
        >
            <h3 className="font-semibold">Observaciones de préstamos</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
                {observations.map((observation) => (
                    <li key={observation}>{observation}</li>
                ))}
            </ul>
        </section>
    )
}
