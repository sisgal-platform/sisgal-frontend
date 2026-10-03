import { MODULES } from "@/config/modules.catalog";
import { ModulePage } from "@/pages/module/ModulePage";

export function ReportesPage() {
    const modulo = MODULES.find((item) => item.id === "reportes");
    if (!modulo) return null;
    return <ModulePage module={modulo} />;
}
