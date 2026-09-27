import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/atoms/SectionHeader";

import { SucursalTable } from "./components/SucursalTable";

export function SucursalesFeature() {
    return (
        <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    eyebrow="Configuración"
                    title="Sucursales"
                    description="Administración de sedes, estados y configuración de cada sucursal."
                />

                <Button type="button" variant="default">
                    Nueva sucursal
                </Button>
            </div>

            <Tabs defaultValue="listado" className="w-full">
                <TabsList>
                    <TabsTrigger value="listado">Listado</TabsTrigger>
                    <TabsTrigger value="configuracion">
                        Configuración
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="listado" className="pt-4">
                    <SucursalTable />
                </TabsContent>

                <TabsContent value="configuracion" className="pt-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        Aquí se gestionará la configuración general de cada
                        sucursal.
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}
