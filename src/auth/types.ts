export type UserRole = 'ADMINISTRADOR'

export interface LoginDto {
  email: string
  password: string
}

export interface SignupDto {
  email: string
  password: string
  fullName?: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface UserDto {
  id: string
  fullName: string
  documentNumber?: string
  email: string
  emailConfirmed: boolean
  role: UserRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  /** Timestamp Unix (segundos). */
  expiresAt: number
  tokenType: 'bearer'
}

export interface AuthResponseDto {
  user: UserDto
  tokens: AuthTokens
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}