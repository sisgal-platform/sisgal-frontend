import { NavLink } from "react-router";
import { MODULES } from "../../config/modules.catalog";
import { useSession } from "../../session/hooks/useSession";

type NavMenuProps = {
    readonly onNavigate?: () => void;
};

export function NavMenu({ onNavigate }: NavMenuProps) {
    const { user } = useSession();

    return (
        <nav className="nav" aria-label="Módulos del sistema">
            <ul className="nav-list">
                {MODULES.filter(
                    (module) =>
                        !module.adminOnly || user?.rol === "administrador",
                ).map((module) => (
                    <li key={module.id}>
                        <NavLink
                            to={module.path}
                            end={module.path === "/"}
                            className={({ isActive }) =>
                                isActive ? "nav-link is-active" : "nav-link"
                            }
                            onClick={onNavigate}
                        >
                            <svg
                                className="nav-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d={module.icon} />
                            </svg>
                            <span>{module.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
