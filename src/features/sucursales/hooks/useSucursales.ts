import { useCallback, useEffect, useState } from "react";

import { sucursalesService } from "../services/sucursalesService";
import type { Sucursal } from "../interfaces/types";

export function useSucursales() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSucursales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await sucursalesService.list();

      setSucursales(data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
      setError("No fue posible cargar las sucursales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSucursales();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSucursales]);

  return {
    sucursales,
    loading,
    error,
    reload: loadSucursales,
  };
}