import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/atoms/SectionHeader";
import { useToast } from "@/toast/hooks/useToast";

import { CreateSucursalDialog } from "./components/CreateSucursalDialog";
import { InactivateSucursalDialog } from "./components/InactivateSucursalDialog";
import { SucursalTable } from "./components/SucursalTable";
import { useSucursales } from "./hooks/useSucursales";
import { sucursalesService } from "./services/sucursalesService";

import type { Sucursal, SucursalCreatePayload } from "./interfaces/types";

export function SucursalesFeature() {
    const { sucursales, loading, error, reload } = useSucursales();

    const { showToast } = useToast();

    const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
        null,
    );

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const handleDeleteRequest = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (id: number | string) => {
        await sucursalesService.remove(String(id));

        await reload();

        showToast("Sucursal inactivada correctamente.", "success");

        setIsDeleteDialogOpen(false);
        setSelectedSucursal(null);
    };

    const handleSucursalCreated = async () => {
        await reload();
        showToast("Sucursal creada correctamente.", "success");
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

                <Button
                    type="button"
                    variant="default"
                    onClick={() => setIsCreateDialogOpen(true)}
                >
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

            <CreateSucursalDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onCreated={handleSucursalCreated}
            />
        </section>
    );
}
