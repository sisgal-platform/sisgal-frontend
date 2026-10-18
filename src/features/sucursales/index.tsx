import { useState } from "react";

import { SectionHeader } from "@/components/atoms/SectionHeader";
import { useToast } from "@/toast/hooks/useToast";

import { CreateSucursalDialog } from "./components/CreateSucursalDialog";
import { InactivateSucursalDialog } from "./components/InactivateSucursalDialog";
import { SucursalTable } from "./components/SucursalTable";
import { useSucursales } from "./hooks/useSucursales";
import { sucursalesService } from "./services/sucursalesService";

import type { Sucursal } from "./interfaces/types";
import { Plus } from "lucide-react";

export function SucursalesFeature() {
    const { sucursales, loading, error, reload } = useSucursales();

    const { showToast } = useToast();

    const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(
        null,
    );

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(
        null,
    );
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");

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

    const handleEditRequest = (sucursal: Sucursal) => {
        setEditingSucursal(sucursal);
        setDialogMode("edit");
        setIsCreateDialogOpen(true);
    };

    const handleSucursalCreated = async () => {
        await reload();
        showToast("Sucursal creada correctamente.", "success");
    };

    const handleSucursalUpdated = async () => {
        await reload();
        showToast("Sucursal actualizada correctamente.", "success");
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
                <SectionHeader
                    title="Sucursales"
                    description="Gestión de sucursales y su información relacionada."
                />

                <button
                    type="button"
                    onClick={() => {
                        setDialogMode("create");
                        setEditingSucursal(null);
                        setIsCreateDialogOpen(true);
                    }}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                    <Plus size={18} aria-hidden="true" />
                    Crear sucursal
                </button>
            </div>

            <SucursalTable
                sucursales={sucursales}
                onDelete={handleDeleteRequest}
                onEdit={handleEditRequest}
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
                mode={dialogMode}
                sucursal={editingSucursal}
                onOpenChange={(nextOpen) => {
                    setIsCreateDialogOpen(nextOpen);
                    if (!nextOpen) {
                        setEditingSucursal(null);
                        setDialogMode("create");
                    }
                }}
                onCreated={handleSucursalCreated}
                onUpdated={handleSucursalUpdated}
            />
        </section>
    );
}
