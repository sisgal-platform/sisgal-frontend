import type { AppModule } from "../../config/modules.catalog";

type ModulePageProps = {
    module: AppModule;
};

/**
 * Marco común de un módulo. El contenido real llega con las historias de cada
 * Epic; por ahora la HU34 solo necesita que cada ruta rinda su cabecera.
 */
export function ModulePage({ module }: ModulePageProps) {
    return (
        <article className="modulo" aria-labelledby="titulo-modulo">
            <h1 id="titulo-modulo" className="modulo-titulo">
                {module.label}
            </h1>
            <p className="modulo-descripcion">{module.description}</p>
            <div className="modulo-placeholder">
                <p>
                    Pendiente: se construye en las historias del work item{" "}
                    <code>#{module.workItem}</code>
                </p>
            </div>
        </article>
    );
}
