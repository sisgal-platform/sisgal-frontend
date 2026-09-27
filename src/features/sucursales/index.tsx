import { Button } from "@/components/ui/button";

import { SectionHeader } from "@/components/atoms/SectionHeader";

import { SucursalTable } from "./components/SucursalTable";
import { useSucursales } from "./hooks/useSucursales";

export function SucursalesFeature() {
    const { sucursales, loading, error } = useSucursales();

    if (loading) {
        return <div>Cargando sucursales...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader title="Sucursales" />

                <Button type="button" variant="default">
                    Nueva sucursal
                </Button>
            </div>

            <SucursalTable sucursales={sucursales} />
        </section>
    );
}
