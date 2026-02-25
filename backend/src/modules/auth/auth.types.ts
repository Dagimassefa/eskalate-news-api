export type UserRole = 'author' | 'reader'

export interface SignupInput {
	name: string
	email: string
	password: string
	role: UserRole
}

export interface LoginInput {
	email: string
	password: string
}

export interface AuthTokenPayload {
	sub: string
	role: UserRole
}
