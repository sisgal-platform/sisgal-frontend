import axios from 'axios'
import { AUTH_URL } from '../config/env'
import type {
  ApiError,
  AuthResponseDto,
  LoginDto,
  RefreshTokenDto,
  SignupDto,
} from './types'

const client = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' },
})

async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await promise
    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw (error.response.data as ApiError) ?? {
        statusCode: error.response.status,
        message: 'Error inesperado del servidor',
      }
    }
    throw error
  }
}

export function login(dto: LoginDto): Promise<AuthResponseDto> {
  return request(client.post<AuthResponseDto>('/login', dto))
}

export function signup(
  dto: SignupDto,
  accessToken: string,
): Promise<AuthResponseDto> {
  return request(
    client.post<AuthResponseDto>('/signup', dto, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  )
}

export function refresh(refreshToken: string): Promise<AuthResponseDto> {
  const body: RefreshTokenDto = { refreshToken }
  return request(client.post<AuthResponseDto>('/refresh', body))
}

export function logout(): Promise<{ success: boolean }> {
  return request(client.post<{ success: boolean }>('/logout'))
}
