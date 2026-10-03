import { Clock3, Mail, Phone, type LucideIcon } from "lucide-react";

export type SupportChannel = {
    id: string;
    label: string;
    value: string;
    href?: string;
    Icon: LucideIcon;
    iconClass: string;
};

export const SUPPORT_CHANNELS: readonly SupportChannel[] = [
    {
        id: "email",
        label: "Email",
        value: "soporte@nominarestaurant.com",
        href: "mailto:soporte@nominarestaurant.com",
        Icon: Mail,
        iconClass: "bg-primary/10 text-primary",
    },
    {
        id: "phone",
        label: "Teléfono",
        value: "+57 (1) 234-5678",
        href: "tel:+5712345678",
        Icon: Phone,
        iconClass: "bg-success-light text-success",
    },
    {
        id: "hours",
        label: "Horario de atención",
        value: "Lunes a viernes, de 8:00 a. m. a 6:00 p. m.",
        Icon: Clock3,
        iconClass: "bg-warning-light text-warning",
    },
];
