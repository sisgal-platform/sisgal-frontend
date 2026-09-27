import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CargosFeature } from "@/features/cargos";
import { SucursalesFeature } from "@/features/sucursales";

export function ConfiguracionFeature() {
    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                    Administración
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Configuración del sistema
                </h1>
            </div>

            <Tabs defaultValue="sucursales" className="w-full">
                <TabsList>
                    <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
                    <TabsTrigger value="cargos">Cargos</TabsTrigger>
                    <TabsTrigger value="empresa">Empresa</TabsTrigger>
                </TabsList>

                <TabsContent value="sucursales" className="pt-4">
                    <SucursalesFeature />
                </TabsContent>

                <TabsContent value="cargos" className="pt-4">
                    <CargosFeature />
                </TabsContent>

                <TabsContent value="empresa" className="pt-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                        Configuración de la empresa y parámetros globales.
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}
