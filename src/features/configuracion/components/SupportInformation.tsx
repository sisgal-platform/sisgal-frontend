import { SectionHeader } from "@/components/atoms";
import { SUPPORT_CHANNELS } from "../constants/supportChannels";
import { SupportChannelCard } from "./SupportChannelCard";

export function SupportInformation() {
    return (
        <section aria-labelledby="soporte-titulo" className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    title="Soporte"
                    description="Canales de soporte y contacto para asistencia técnica y consultas relacionadas con el sistema."
                />
            </div>

            <section
                aria-label="Canales de soporte"
                className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
                {SUPPORT_CHANNELS.map((channel) => (
                    <SupportChannelCard key={channel.id} channel={channel} />
                ))}
            </section>
        </section>
    );
}
