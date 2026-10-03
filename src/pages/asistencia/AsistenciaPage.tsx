import { MODULES } from "@/config/modules.catalog";
import { ModulePage } from "@/pages/module/ModulePage";

export function AsistenciaPage() {
    const modulo = MODULES.find((item) => item.id === "asistencia");
    if (!modulo) return null;
    return <ModulePage module={modulo} />;
}
