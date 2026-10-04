import { useState } from "react";

import { HistorialFiltros } from "./HistorialFiltros";
import { HistorialPaginacion } from "./HistorialPaginacion";
import { HistorialTable } from "./HistorialTable";
import { useEmpleadosFiltro } from "../hooks/useEmpleadosFiltro";
import { useHistorialAsistencia } from "../hooks/useHistorialAsistencia";
import type {
    FiltrosHistorial,
    ResultadosPorPagina,
} from "../interfaces/types";
import { validarRangoFechas } from "../utils/fechas";

const filtrosVacios: FiltrosHistorial = {
    empleadoId: "",
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
};

const PAGINA_INICIAL = 1;
const RESULTADOS_POR_DEFECTO: ResultadosPorPagina = 10;

export function HistorialAsistencia() {
    const [filtros, setFiltros] = useState(filtrosVacios);
    const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosVacios);
    const [pagina, setPagina] = useState(PAGINA_INICIAL);
    const [porPagina, setPorPagina] = useState(RESULTADOS_POR_DEFECTO);
    const [errorFechas, setErrorFechas] = useState<string | null>(null);

    const empleados = useEmpleadosFiltro();
    const { historial, cargando, error, recargar } = useHistorialAsistencia({
        ...filtrosAplicados,
        pagina,
        porPagina,
    });

    function cambiarFiltros(nuevos: FiltrosHistorial) {
        setFiltros(nuevos);
        setErrorFechas(null);
    }

    function buscar() {
        const mensaje = validarRangoFechas(filtros);
        setErrorFechas(mensaje);

        // Un rango inválido rechaza la búsqueda: se conservan los resultados actuales.
        if (mensaje) return;

        setFiltrosAplicados(filtros);
        setPagina(PAGINA_INICIAL);
    }

    function limpiarFiltros() {
        setFiltros(filtrosVacios);
        setFiltrosAplicados(filtrosVacios);
        setErrorFechas(null);
        setPagina(PAGINA_INICIAL);
    }

    function cambiarPorPagina(cantidad: ResultadosPorPagina) {
        setPorPagina(cantidad);
        setPagina(PAGINA_INICIAL);
    }

    return (
        <section
            aria-labelledby="historial-asistencia-titulo"
            className="space-y-4"
        >
            <h2
                id="historial-asistencia-titulo"
                className="text-xl font-semibold text-primary"
            >
                Historial de asistencia
            </h2>

            <HistorialFiltros
                filtros={filtros}
                empleados={empleados.empleados}
                cargandoEmpleados={empleados.cargando}
                errorEmpleados={empleados.error}
                errorFechas={errorFechas}
                onCambiar={cambiarFiltros}
                onBuscar={buscar}
                onLimpiar={limpiarFiltros}
            />

            <HistorialTable
                registros={historial?.data ?? []}
                cargando={cargando}
                error={error}
                onReintentar={recargar}
            />

            {!error && historial && historial.total > 0 && (
                <HistorialPaginacion
                    pagina={pagina}
                    porPagina={porPagina}
                    total={historial.total}
                    totalPaginas={historial.totalPaginas}
                    onCambiarPagina={setPagina}
                    onCambiarPorPagina={cambiarPorPagina}
                />
            )}
        </section>
    );
}
