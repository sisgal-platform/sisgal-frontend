import { describe, expect, it } from "vitest";

import {
    dateToInputValue,
    formatCurrencyCOP,
    formatDateCO,
    formatNumberCO,
} from "../lib/formatters";

describe("formatters", () => {
    it("formatea moneda COP y números con separadores colombianos", () => {
        expect(formatCurrencyCOP(2500000)).toMatch(/\$\s?2\.500\.000/);
        expect(formatNumberCO(1234567)).toBe("1.234.567");
    });

    it("formatea fechas ISO y objetos Date en la zona UTC", () => {
        const fecha = "2026-03-10T00:00:00.000Z";

        expect(formatDateCO(fecha)).toBe("10/03/2026");
        expect(formatDateCO(new Date(fecha))).toBe("10/03/2026");
        expect(dateToInputValue(fecha)).toBe("2026-03-10");
        expect(dateToInputValue(new Date(fecha))).toBe("2026-03-10");
    });

    it.each([null, undefined, "", "fecha-invalida"])(
        "maneja la fecha %s sin lanzar errores",
        (fecha) => {
            expect(formatDateCO(fecha)).toBe("—");
            expect(dateToInputValue(fecha)).toBe("");
        },
    );
});