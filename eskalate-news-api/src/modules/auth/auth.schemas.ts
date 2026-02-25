import { z } from 'zod'

const nameRegex = /^[A-Za-z ]+$/

const strongPasswordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const signupSchema = z.object({
	body: z.object({
		name: z
			.string()
			.min(1, 'Name is required')
			.regex(nameRegex, 'Name must contain only alphabets and spaces'),

		email: z
			.string()
			.min(1, 'Email is required')
			.email('Invalid email format'),

		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(
				strongPasswordRegex,
				'Password must contain at least one uppercase, one lowercase, one number, and one special character',
			),

		role: z.enum(['author', 'reader'], {
			errorMap: () => ({
				message: 'Role must be either author or reader',
			}),
		}),
	}),
})

export const loginSchema = z.object({
	body: z.object({
		email: z
			.string()
			.min(1, 'Email is required')
			.email('Invalid email format'),

		password: z.string().min(1, 'Password is required'),
	}),
})
