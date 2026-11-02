import { SectionHeader } from "@/components/atoms/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LegalDeductionsSection } from "./components/LegalDeductionsSection";
import { WorkdayConfigSection } from "./components/WorkdayConfigSection";
import { WorkRatesSection } from "./components/WorkRatesSection";
import { PAYROLL_PARAMETER_CATEGORIES } from "./constants/categories";

/** HU45, HU39, HU37 — Parámetros de nómina por categoría. El acceso lo restringe `ConfiguracionPage`. */
export function ParametrosNominaFeature() {
    return (
        <section className="space-y-6">
            <SectionHeader
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

                <TabsContent value="horas-recargos" className="pt-4">
                    <WorkRatesSection />
                </TabsContent>

                <TabsContent value="descuentos-legales" className="pt-4">
                    <LegalDeductionsSection />
                </TabsContent>
            </Tabs>
        </section>
    );
}
