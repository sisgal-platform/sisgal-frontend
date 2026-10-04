import { useEffect, useState } from "react";

import { employeesService } from "@/features/empleados/services/employeesService";
import type { Employee } from "@/features/empleados/interfaces/types";

/**
 * Empleados para el filtro del historial, ordenados por nombre. Incluye los
 * inactivos: sus marcaciones hacen parte del historial.
 */
export function useEmpleadosFiltro() {
    const [empleados, setEmpleados] = useState<Employee[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            try {
                const datos = await employeesService.list();

                if (!cancelado) {
                    setEmpleados(
                        [...datos].sort((a, b) =>
                            `${a.firstName} ${a.lastName}`.localeCompare(
                                `${b.firstName} ${b.lastName}`,
                                "es",
                            ),
                        ),
                    );
                }
            } catch {
                if (!cancelado) {
                    setError("No fue posible cargar los empleados.");
                }
            } finally {
                if (!cancelado) setCargando(false);
            }
        }

        void cargar();

        return () => {
            cancelado = true;
        };
    }, []);

    return { empleados, cargando, error };
}
