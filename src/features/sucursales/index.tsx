import { useState } from "react";

import { Button } from "@/components/ui/button";

import { SectionHeader } from "@/components/atoms/SectionHeader";

import { InactivateSucursalDialog } from "./components/InactivateSucursalDialog";
import { SucursalTable } from "./components/SucursalTable";
import { useSucursales } from "./hooks/useSucursales";
import { sucursalesService } from "./services/sucursalesService";
import type { Sucursal } from "./interfaces/types";

export function SucursalesFeature() {
    const { sucursales, loading, error, reload } = useSucursales();
    const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
        null,
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDeleteRequest = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (id: number | string) => {
        await sucursalesService.remove(String(id));
        await reload();
    };

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

            <SucursalTable
                sucursales={sucursales}
                onDelete={handleDeleteRequest}
            />

            <InactivateSucursalDialog
                sucursal={selectedSucursal}
                open={isDeleteDialogOpen}
                onOpenChange={(nextOpen) => {
                    setIsDeleteDialogOpen(nextOpen);
                    if (!nextOpen) {
                        setSelectedSucursal(null);
                    }
                }}
                onConfirm={handleDeleteConfirm}
            />
        </section>
    );
}
