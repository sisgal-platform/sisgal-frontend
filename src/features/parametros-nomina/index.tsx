import { SectionHeader } from "@/components/atoms/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WorkdayConfigSection } from "./components/WorkdayConfigSection";
import { PAYROLL_PARAMETER_CATEGORIES } from "./constants/categories";

/** HU45 — Parámetros de nómina por categoría. El acceso lo restringe `ConfiguracionPage`. */
export function ParametrosNominaFeature() {
    return (
        <section className="space-y-6">
            <SectionHeader
                eyebrow="Configuración"
                title="Parámetros de nómina"
                description="Parámetros y reglas laborales que usan los cálculos de asistencia y nómina. Cada cambio rige desde una fecha y conserva su historial."
            />

            <Tabs defaultValue="jornada-laboral" className="w-full">
                <TabsList
                    aria-label="Categorías de parámetros"
                    className="h-auto max-w-full flex-wrap justify-start"
                >
                    {PAYROLL_PARAMETER_CATEGORIES.map(
                        ({ id, label, available }) => (
                            <TabsTrigger
                                key={id}
                                value={id}
                                disabled={!available}
                                title={
                                    available
                                        ? undefined
                                        : "Disponible próximamente"
                                }
                            >
                                {label}
                            </TabsTrigger>
                        ),
                    )}
                </TabsList>

                <TabsContent value="jornada-laboral" className="pt-4">
                    <WorkdayConfigSection />
                </TabsContent>
            </Tabs>
        </section>
    );
}
