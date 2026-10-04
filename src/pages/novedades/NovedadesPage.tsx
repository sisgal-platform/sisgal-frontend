import { MODULES } from "@/config/modules.catalog";
import { ModulePage } from "@/pages/module/ModulePage";

export function NovedadesPage() {
    const modulo = MODULES.find((item) => item.id === "novedades");
    if (!modulo) return null;
    return <ModulePage module={modulo} />;
}
