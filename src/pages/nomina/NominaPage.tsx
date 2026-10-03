import { MODULES } from "@/config/modules.catalog";
import { ModulePage } from "@/pages/module/ModulePage";

export function NominaPage() {
    const modulo = MODULES.find((item) => item.id === "nomina");
    if (!modulo) return null;
    return <ModulePage module={modulo} />;
}
