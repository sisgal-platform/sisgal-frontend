import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import {
    formatNumericValue,
    parseNumericText,
    useNumericField,
    type NumericFieldOptions,
} from "../lib/numericField";

function Campo(options: NumericFieldOptions) {
    const [valor, setValor] = useState("");
    const field = useNumericField(valor, setValor, options);

    return (
        <>
            <input aria-label="Campo" {...field} />
            <output>{valor}</output>
        </>
    );
}

describe("parseNumericText", () => {
    it.each([
        ["1.250.000", "1250000"],
        ["1.250.000,5", "1250000.5"],
        ["1250000,55", "1250000.55"],
        ["1250000,555", "1250000.55"],
        ["1,2,3", "1.23"],
        [",5", "0.5"],
        ["007", "7"],
        ["0", "0"],
        ["-12a3", "123"],
        ["", ""],
    ])("convierte %s en %s", (texto, valor) => {
        expect(parseNumericText(texto)).toBe(valor);
    });

    it("ignora el punto como decimal en valores en pesos", () => {
        expect(parseNumericText("1.25")).toBe("125");
    });

    it("acepta el punto como decimal en porcentajes", () => {
        expect(parseNumericText("4.25", { dotIsDecimal: true })).toBe("4.25");
    });

    it("descarta los decimales si el campo no los admite", () => {
        expect(parseNumericText("12,5", { maxDecimals: 0 })).toBe("12");
    });
});

describe("formatNumericValue", () => {
    it.each([
        ["", ""],
        ["999", "999"],
        ["1000", "1.000"],
        ["1250000", "1.250.000"],
        ["1250000.5", "1.250.000,5"],
        ["1234.", "1.234,"],
        ["0.5", "0,5"],
    ])("muestra %s como %s", (valor, texto) => {
        expect(formatNumericValue(valor)).toBe(texto);
    });
});

describe("useNumericField", () => {
    it("agrega los separadores mientras se escribe y conserva el valor sin formato", async () => {
        const user = userEvent.setup();
        render(<Campo />);
        const campo = screen.getByLabelText("Campo");

        await user.type(campo, "2500000,75");

        expect(campo).toHaveValue("2.500.000,75");
        expect(screen.getByRole("status")).toHaveTextContent("2500000.75");
    });

    it("no mueve el cursor al final al escribir en medio del número", async () => {
        const user = userEvent.setup();
        render(<Campo />);
        const campo = screen.getByLabelText<HTMLInputElement>("Campo");

        await user.type(campo, "1000");
        await user.type(campo, "9", {
            initialSelectionStart: 1,
            initialSelectionEnd: 1,
        });

        expect(campo).toHaveValue("19.000");
        expect(campo.selectionStart).toBe(2);
    });

    it("permite borrar hasta dejar el campo vacío", async () => {
        const user = userEvent.setup();
        render(<Campo />);
        const campo = screen.getByLabelText("Campo");

        await user.type(campo, "1000");
        await user.clear(campo);

        expect(campo).toHaveValue("");
        expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });
});
