import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CargosFeature } from "@/features/cargos";
import { SucursalesFeature } from "@/features/sucursales";

export function ConfiguracionFeature() {
    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Configuración del sistema
                </h1>

                <p className="mt-2 text-sm text-primary-light sm:text-base">
                    Administra la configuración general del sistema, incluyendo sucursales y otros parámetros importantes.
                </p>
            </div>

            <Tabs defaultValue="sucursales" className="w-full">
                <TabsList>
                    <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
                    <TabsTrigger value="cargos">Cargos</TabsTrigger>
                </TabsList>

                <TabsContent value="sucursales" className="p-4">
                    <SucursalesFeature />
                </TabsContent>

                <TabsContent value="cargos" className="p-4">
                    <CargosFeature />
                </TabsContent>
            </Tabs>
        </section>
    );
}
