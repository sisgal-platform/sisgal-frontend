import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/lib/axios";

import { payrollPeriodsService } from "../services/payrollPeriodsService";
import type { PayrollPeriod, PayrollPeriodDetail } from "../interfaces/types";

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const client = vi.mocked(apiClient);

const PAYROLL_PERIOD: PayrollPeriod = {
    id: 1,
    employeeId: 1,
    employeeName: "Ana Barros",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    settlementDate: "2026-09-30",
    totalEarnings: 1800000,
    totalDeductions: 150000,
    netPay: 1650000,
    status: "Confirmada",
};

const PAYROLL_PERIOD_DETAIL: PayrollPeriodDetail = {
    ...PAYROLL_PERIOD,
    employeeDocumentType: "CC",
    employeeDocument: "1020304050",
    employeePosition: "Mesera",
    earnings: [{ conceptName: "Salario base", amount: 1800000 }],
    deductions: [{ conceptName: "Salud y pensión", amount: 150000 }],
};

describe("payrollPeriodsService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("lista todas las liquidaciones sin filtros", async () => {
        client.get.mockResolvedValue({ data: [PAYROLL_PERIOD] });

        await expect(payrollPeriodsService.findAll()).resolves.toEqual([
            PAYROLL_PERIOD,
        ]);
        expect(client.get).toHaveBeenCalledWith("/liquidaciones", {
            params: {},
        });
    });

    it("lista las liquidaciones con los filtros recibidos", async () => {
        client.get.mockResolvedValue({ data: [PAYROLL_PERIOD] });

        await payrollPeriodsService.findAll({
            employeeId: 1,
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        });

        expect(client.get).toHaveBeenCalledWith("/liquidaciones", {
            params: {
                employeeId: 1,
                periodStart: "2026-09-01",
                periodEnd: "2026-09-30",
            },
        });
    });

    it("consulta el detalle de una liquidación por id", async () => {
        client.get.mockResolvedValue({ data: PAYROLL_PERIOD_DETAIL });

        await expect(payrollPeriodsService.findById(1)).resolves.toEqual(
            PAYROLL_PERIOD_DETAIL,
        );
        expect(client.get).toHaveBeenCalledWith("/liquidaciones/1");
    });

    it("genera la preliquidación para el empleado en la ruta y envía solo el período", async () => {
        client.post.mockResolvedValue({ data: PAYROLL_PERIOD_DETAIL });
        const request = {
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        };

        await expect(
            payrollPeriodsService.generatePreliquidation(1, request),
        ).resolves.toEqual(PAYROLL_PERIOD_DETAIL);
        expect(client.post).toHaveBeenCalledWith("/preliquidacion/1", request);
    });

    it("confirma la preliquidación y retorna la liquidación creada", async () => {
        client.post.mockResolvedValue({ data: PAYROLL_PERIOD_DETAIL });
        const request = {
            employeeId: 1,
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        };

        await expect(
            payrollPeriodsService.confirmPreliquidation(request),
        ).resolves.toEqual(PAYROLL_PERIOD_DETAIL);

        expect(client.post).toHaveBeenCalledWith("/liquidaciones/1", {
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        });
    });

    describe("getPdf", () => {
        it("descarga el comprobante como blob", async () => {
            const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
            client.get.mockResolvedValue({ data: blob });

            await expect(payrollPeriodsService.getPdf(1)).resolves.toBe(blob);
            expect(client.get).toHaveBeenCalledWith("/liquidaciones/1/pdf", {
                responseType: "blob",
            });
        });

        it("recupera el mensaje real del backend aunque el error llegue como blob", async () => {
            const cuerpoError = new Blob(
                [
                    JSON.stringify({
                        message: "No fue posible determinar la sucursal.",
                    }),
                ],
                {
                    type: "application/json",
                },
            );
            client.get.mockRejectedValue({
                isAxiosError: true,
                response: { status: 422, data: cuerpoError },
            });

            await expect(payrollPeriodsService.getPdf(1)).rejects.toThrow(
                "No fue posible determinar la sucursal.",
            );
        });

        it("usa un mensaje genérico cuando el blob de error no es JSON legible", async () => {
            const cuerpoError = new Blob(["no es json"], {
                type: "text/plain",
            });
            client.get.mockRejectedValue({
                isAxiosError: true,
                response: { status: 500, data: cuerpoError },
            });

            await expect(payrollPeriodsService.getPdf(1)).rejects.toThrow(
                "Ocurrió un error inesperado. Intenta de nuevo.",
            );
        });
    });
});
