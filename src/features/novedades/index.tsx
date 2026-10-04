import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncapacidadesFeature } from "@/features/incapacidades";

export function NovedadesFeature() {
    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Novedades
                </h1>

                <p className="mt-2 text-sm text-primary-light sm:text-base">
                    Gestiona las novedades de los empleados, incluyendo incapacidades, licencias y otros registros.
                </p>
            </div>

            <Tabs defaultValue="incapacidades" className="w-full">
                <TabsList>
                    <TabsTrigger value="incapacidades">Incapacidades</TabsTrigger>
                </TabsList>

                <TabsContent value="incapacidades" className="p-4">
                    <IncapacidadesFeature />
                </TabsContent>
            </Tabs>
        </section>
    );
}
