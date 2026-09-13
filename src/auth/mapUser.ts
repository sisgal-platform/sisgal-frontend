import type { SessionUser } from "../session/types";
import type { UserDto, UserRole } from "./types";



const ROLE_MAP: Record<UserRole, SessionUser['rol']>={
    ADMINISTRADOR: 'administrador',
}

export function mapUserDtoToSessionUser(user: UserDto) {
    return {
        id: user.id,
        nombre: user.fullName,
        rol: ROLE_MAP[user.role],
    }
}