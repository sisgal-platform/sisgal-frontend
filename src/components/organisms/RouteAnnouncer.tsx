import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { findModuleByPath } from "../../config/modules.catalog";

export function RouteAnnouncer() {
    const { pathname } = useLocation();
    const [mensaje, setMensaje] = useState("");
    const esPrimeraCarga = useRef(true);

    useEffect(() => {
        if (esPrimeraCarga.current) {
            esPrimeraCarga.current = false;
            return;
        }

        const module = findModuleByPath(pathname);
        setMensaje(
            module
                ? `${module.label}. Módulo cargado.`
                : "Página no encontrada.",
        );

        const contenido = document.getElementById("contenido");
        contenido?.focus({ preventScroll: true });
    }, [pathname]);

    return (
        <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            {mensaje}
        </div>
    );
}
