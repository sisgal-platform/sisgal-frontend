import { AUTH_URL } from "../config/env";
import type { ApiError, AuthResponseDto, LoginDto, RefreshTokenDto, SignupDto } from "./types";


async function request<T>(path: string, options: RequestInit = {}): Promise<T>{
    const response = await fetch(`${AUTH_URL}${path}`,{
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    const body = (await response.json().catch(()=>null)) as ApiError |T| null

    if (!response.ok) {
        throw (body as ApiError) ?? {
            statusCode: response.status,
            message: 'Error inesperado del servidor',
        }
    }

    return body as T
}

export async function login(dto:LoginDto):Promise<AuthResponseDto> {
    return request<AuthResponseDto>('/login', {
        method: 'POST',
        body: JSON.stringify(dto),
    })
}

export async function signup(dto:SignupDto , accessToken: string,): Promise<AuthResponseDto> {
    return request<AuthResponseDto>('/signup',{
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`},
        body: JSON.stringify(dto),
    })
}

export async function refresh(refreshToken:string,): Promise<AuthResponseDto> {
    const body: RefreshTokenDto = {refreshToken}

    return request<AuthResponseDto>('/refresh', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export async function logout(): Promise<{success: boolean}> {
    return request <{success: boolean}>('/logout', {method:'POST'})
}