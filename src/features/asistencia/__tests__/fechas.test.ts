import { afterEach, describe, expect, it, vi } from "vitest";

import {
    esOtroDia,
    fechaActual,
    formatFechaMarcacion,
    formatHoraMarcacion,
    formatHorasTrabajadas,
    validarRangoFechas,
} from "../utils/fechas";

describe("Fechas del historial de asistencia", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe("fechaActual", () => {
        it("usa la fecha de Colombia aunque en UTC ya sea el día siguiente", () => {
            vi.useFakeTimers({ toFake: ["Date"] });
            // 10:00 p. m. del 4 de octubre en Colombia.
            vi.setSystemTime(new Date("2026-10-05T03:00:00.000Z"));

            expect(fechaActual()).toBe("2026-10-04");
        });
    });

    describe("formato de las marcaciones", () => {
        it("muestra la fecha y la hora en la zona horaria de Colombia", () => {
            expect(formatFechaMarcacion("2026-09-15T13:00:00.000Z")).toBe(
                "15/09/2026",
            );
            expect(formatHoraMarcacion("2026-09-15T13:00:00.000Z")).toBe(
                "8:00 a. m.",
            );
            expect(formatHoraMarcacion("2026-09-15T21:30:00.000Z")).toBe(
                "4:30 p. m.",
            );
        });

        it("ubica en el día anterior una marcación de la noche en Colombia", () => {
            // 11:30 p. m. del 15 de septiembre en Colombia.
            expect(formatFechaMarcacion("2026-09-16T04:30:00.000Z")).toBe(
                "15/09/2026",
            );
        });

        it("detecta los turnos que cruzan la medianoche", () => {
            expect(
                esOtroDia(
                    "2026-09-15T23:00:00.000Z",
                    "2026-09-16T07:00:00.000Z",
                ),
            ).toBe(true);
            expect(
                esOtroDia(
                    "2026-09-15T13:00:00.000Z",
                    "2026-09-15T21:30:00.000Z",
                ),
            ).toBe(false);
        });
    });

    describe("formatHorasTrabajadas", () => {
        it.each([
            [510, "8 h 30 min"],
            [480, "8 h 00 min"],
            [45, "0 h 45 min"],
            [0, "0 h 00 min"],
            [605, "10 h 05 min"],
        ])("convierte %i minutos en %s", (minutos, esperado) => {
            expect(formatHorasTrabajadas(minutos)).toBe(esperado);
        });
    });

    describe("validarRangoFechas", () => {
        const HOY = "2026-10-04";

        it.each([
            ["sin fechas", "", ""],
            ["solo la fecha inicial", "2026-09-01", ""],
            ["solo la fecha final", "", "2026-09-30"],
            ["un rango de un solo día", "2026-09-15", "2026-09-15"],
            ["el 1 de enero de 1900 como fecha inicial", "1900-01-01", ""],
            ["la fecha actual como fecha final", "2026-09-01", HOY],
        ])("acepta %s", (_caso, fechaDesde, fechaHasta) => {
            expect(validarRangoFechas({ fechaDesde, fechaHasta }, HOY)).toBeNull();
        });

        it("rechaza una fecha inicial posterior a la fecha final", () => {
            expect(
                validarRangoFechas(
                    { fechaDesde: "2026-09-30", fechaHasta: "2026-09-01" },
                    HOY,
                ),
            ).toBe(
                "El rango de fechas seleccionado no es válido: la fecha inicial no puede ser posterior a la fecha final.",
            );
        });

        it("rechaza una fecha inicial anterior al 1 de enero de 1900", () => {
            expect(
                validarRangoFechas(
                    { fechaDesde: "1899-12-31", fechaHasta: "" },
                    HOY,
                ),
            ).toBe(
                "La fecha inicial no puede ser anterior al 1 de enero de 1900.",
            );
        });

        it("rechaza una fecha final posterior a la fecha actual", () => {
            expect(
                validarRangoFechas(
                    { fechaDesde: "", fechaHasta: "2026-10-05" },
                    HOY,
                ),
            ).toBe("La fecha final no puede ser posterior a la fecha actual.");
        });
    });
});
