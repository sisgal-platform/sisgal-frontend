import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CargosFeature } from "@/features/cargos";
import { ParametrosNominaFeature } from "@/features/parametros-nomina";
import { SucursalesFeature } from "@/features/sucursales";
import { SupportInformation } from "./components/SupportInformation";
import { SectionHeader } from "@/components/atoms";

export function ConfiguracionFeature() {
    return (
        <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    eyebrow="Gestión"
                    title="Configuración"
                    description="Gestión de sucursales, cargos y parámetros de nómina."
                />
            </div>

            <Tabs defaultValue="sucursales" className="w-full">
                <TabsList className="h-auto max-w-full flex-wrap justify-start">
                    <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
                    <TabsTrigger value="cargos">Cargos</TabsTrigger>
                    <TabsTrigger value="parametros-nomina">
                        Parámetros de nómina
                    </TabsTrigger>
                    <TabsTrigger value="soporte">Soporte</TabsTrigger>
                </TabsList>

                <TabsContent value="sucursales" className="p-4">
                    <SucursalesFeature />
                </TabsContent>

                <TabsContent value="cargos" className="p-4">
                    <CargosFeature />
                </TabsContent>

                <TabsContent value="parametros-nomina" className="p-4">
                    <ParametrosNominaFeature />
                </TabsContent>

                <TabsContent value="soporte" className="p-4">
                    <SupportInformation />
                </TabsContent>
            </Tabs>
        </section>
    );
}
