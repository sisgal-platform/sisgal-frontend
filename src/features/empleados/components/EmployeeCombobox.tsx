import { Combobox } from "@/components/ui/combobox";
import type { FocusEventHandler } from "react";

import type { Employee } from "../interfaces/types";

type EmployeeComboboxProps = Readonly<{
    employees: readonly Employee[];
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
    placeholder?: string;
    allLabel?: string;
    id?: string;
    valueBy?: "id" | "document";
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
    onBlur?: FocusEventHandler<HTMLInputElement>;
}>;

export function EmployeeCombobox({
    employees,
    value,
    onChange,
    loading,
    disabled,
    placeholder = "Buscar por nombre o documento",
    allLabel,
    id,
    valueBy = "id",
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
    onBlur,
}: EmployeeComboboxProps) {
    const options = employees.map((employee) => ({
        value: valueBy === "document" ? employee.document : String(employee.id),
        label: `${employee.firstName} ${employee.lastName} · ${employee.document}`,
    }));

    return (
        <Combobox
            options={options}
            value={value}
            onChange={onChange}
            loading={loading}
            disabled={disabled}
            placeholder={placeholder}
            allLabel={allLabel}
            id={id}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            onBlur={onBlur}
        />
    );
}
