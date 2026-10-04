import { SectionHeader } from "@/components/atoms/SectionHeader"

import { RegisterDisabilityLeaveModal } from "./components/RegisterDisabilityLeaveModal"

export function IncapacidadesFeature() {
    return (
        <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    eyebrow="Novedades"
                    title="Incapacidades"
                    description="Registro de incapacidades y licencias de los empleados."
                />

                <RegisterDisabilityLeaveModal />
            </div>
        </section>
    )
}
