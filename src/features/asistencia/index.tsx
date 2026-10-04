import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AsistenciaHoy } from "./components/AsistenciaHoy";
import { HistorialAsistencia } from "./components/HistorialAsistencia";

export function AsistenciaFeature() {
    return (
        <section className="space-y-6 p-4">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Asistencia
                </h1>
                <p className="text-sm text-primary-light sm:text-base">
                    Consulta quién ha ingresado hoy y el historial de
                    marcaciones y horas trabajadas de los empleados.
                </p>
            </header>

            <Tabs defaultValue="hoy" className="w-full">
                <TabsList>
                    <TabsTrigger value="hoy">Asistencia hoy</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="hoy" className="pt-2">
                    <AsistenciaHoy />
                </TabsContent>

                <TabsContent value="historial" className="pt-2">
                    <HistorialAsistencia />
                </TabsContent>
            </Tabs>
        </section>
    );
}
