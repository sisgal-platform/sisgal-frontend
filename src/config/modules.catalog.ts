/**
 * Catálogo de módulos del sistema — fuente única de verdad para el menú y las rutas.
 *
 * Cada entrada corresponde a un Epic/Feature del backlog de AttendancePayrollSystem,
 * de modo que agregar un módulo nuevo sea editar este arreglo y nada más.
 */

export type ModuleId =
    | "dashboard"
    | "asistencia"
    | "nomina"
    | "incapacidades"
    | "personal"
    | "prestamos"
    | "configuracion";

export type AppModule = {
    /** Identificador estable, usado en tests y como key de React. */
    id: ModuleId;
    /** Ruta absoluta del módulo. */
    path: string;
    /** Etiqueta visible en el menú de navegación. */
    label: string;
    /** Descripción corta que se muestra en la cabecera del módulo. */
    description: string;
    /** Work item de Azure DevOps que respalda el módulo. */
    workItem?: number;
    /** Path de un icono SVG de 24x24 dibujado con stroke. */
    icon: string;
    /** Si está presente, el módulo solo se muestra a administradores. */
    adminOnly?: boolean;
};

export const MODULES: readonly AppModule[] = [
    {
        id: "dashboard",
        path: "/",
        label: "Dashboard",
        description: "Indicadores generales de asistencia y nómina.",
        workItem: 26,
        icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
    },
    {
        id: "asistencia",
        path: "/asistencia",
        label: "Asistencia",
        description: "Registro, consulta y control de la jornada laboral.",
        workItem: 4,
        icon: "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
    },
    {
        id: "nomina",
        path: "/nomina",
        label: "Nómina",
        description: "Cálculo de nómina y gestión de liquidaciones.",
        workItem: 5,
        icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    },
    {
        id: "personal",
        path: "/personal",
        label: "Personal",
        description: "Administración de empleados y accesos.",
        workItem: 6,
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    },
    {
        id: "incapacidades",
        path: "/incapacidades",
        label: "Incapacidades",
        description:
            "Registro y consulta de incapacidades y licencias de los empleados.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
        adminOnly: true,
    },

    {
        id: "prestamos",
        path: "/prestamos",
        label: "Préstamos",
        description: "Gestión de préstamos a empleados.",
        icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
        adminOnly: true,
    },
    {
        id: "configuracion",
        path: "/configuracion",
        label: "Configuración",
        description: "Parámetros generales del sistema.",
        workItem: 27,
        icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-4l-.4 2.6c-.7.3-1.4.7-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2l.4 2.6h4l.4-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
    },
];

/** Devuelve el módulo cuya ruta corresponde al pathname dado, o undefined. */
export function findModuleByPath(pathname: string): AppModule | undefined {
    if (pathname === "/") return MODULES.find((m) => m.path === "/");
    return MODULES.find((m) => m.path !== "/" && pathname.startsWith(m.path));
}
