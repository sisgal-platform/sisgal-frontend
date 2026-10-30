import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AsistenciaHoy } from "./components/AsistenciaHoy";
import { HistorialAsistencia } from "./components/HistorialAsistencia";
import { LectorHuellaSimulado } from "./components/LectorHuellaSimulado";
import { SectionHeader } from "@/components/atoms";

export function AsistenciaFeature() {
    return (
        <section className="space-y-6 p-4">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    eyebrow="Gestión"
                    title="Asistencia"
                    description="Registro, consulta y control de la jornada laboral."
                />
            </div>

            <Tabs defaultValue="hoy" className="w-full">
                <TabsList>
                    <TabsTrigger value="hoy">Asistencia hoy</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                    <TabsTrigger value="lector">Lector de huella</TabsTrigger>
                </TabsList>

                <TabsContent value="hoy" className="pt-2">
                    <AsistenciaHoy />
                </TabsContent>

                <TabsContent value="historial" className="pt-2">
                    <HistorialAsistencia />
                </TabsContent>

                <TabsContent value="lector" className="pt-2">
                    <LectorHuellaSimulado />
                </TabsContent>
            </Tabs>
        </section>
    );
}
