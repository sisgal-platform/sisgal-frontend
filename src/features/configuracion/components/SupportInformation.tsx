import { SUPPORT_CHANNELS } from "../constants/supportChannels";
import { SupportChannelCard } from "./SupportChannelCard";

export function SupportInformation() {
    return (
        <section aria-labelledby="soporte-titulo" className="space-y-5">
            <header className="space-y-2">
                <h2
                    id="soporte-titulo"
                    className="text-2xl font-bold text-primary"
                >
                    Contacto con Soporte Técnico
                </h2>
                <p className="max-w-3xl text-sm leading-6 text-text-muted">
                    ¿Tienes algún problema o necesitas ayuda? Nuestro equipo de
                    desarrollo está aquí para asistirte.
                </p>
            </header>

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