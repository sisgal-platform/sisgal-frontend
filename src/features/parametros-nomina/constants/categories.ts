export type PayrollParameterCategory = {
    id: string;
    label: string;
    /** Las categorías sin implementar se muestran deshabilitadas. */
    available: boolean;
};

/** Categorías en las que se organizan los parámetros de nómina (HU45). */
export const PAYROLL_PARAMETER_CATEGORIES: readonly PayrollParameterCategory[] =
    [
        { id: "jornada-laboral", label: "Jornada laboral", available: true },
        { id: "horas", label: "Horas ordinarias y extra", available: false },
        { id: "recargos", label: "Recargos", available: false },
        { id: "deducciones", label: "Deducciones", available: false },
        {
            id: "auxilio-transporte",
            label: "Auxilio de transporte",
            available: false,
        },
        { id: "primas", label: "Primas", available: false },
        { id: "otros", label: "Otros conceptos", available: false },
    ];
