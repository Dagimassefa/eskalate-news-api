import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'

vi.mock('../../utils/password', () => ({
	hashPassword: vi.fn(),
	verifyPassword: vi.fn(),
}))

import { hashPassword, verifyPassword } from '../../utils/password'

describe('Auth endpoints', () => {
	const { request } = makeApp()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('POST /api/auth/signup should create user and return 201', async () => {
		vi.mocked(hashPassword).mockResolvedValueOnce('hashed-password')

		mockPrisma.user.create.mockResolvedValueOnce({
			id: 'u1',
			name: 'John Doe',
			email: 'john@example.com',
			role: 'author',
			createdAt: new Date(),
		} as any)

		const res = await request.post('/api/auth/signup').send({
			name: 'John Doe',
			email: 'john@example.com',
			password: 'Strong@123',
			role: 'author',
		})

		expect(res.status).toBe(201)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.email).toBe('john@example.com')
	})

	it('POST /api/auth/signup should return 400 when password not strong', async () => {
		const res = await request.post('/api/auth/signup').send({
			name: 'John Doe',
			email: 'john@example.com',
			password: 'weakpass',
			role: 'author',
		})

		expect(res.status).toBe(400)
		expect(res.body.Success).toBe(false)
		expect(res.body.Errors).toBeTruthy()
	})

	it('POST /api/auth/login should return token on valid credentials', async () => {
		mockPrisma.user.findUnique.mockResolvedValueOnce({
			id: 'u2',
			name: 'Reader One',
			email: 'reader@example.com',
			password: 'hashed-password',
			role: 'reader',
			createdAt: new Date(),
		} as any)

		vi.mocked(verifyPassword).mockResolvedValueOnce(true)

		const res = await request.post('/api/auth/login').send({
			email: 'reader@example.com',
			password: 'Strong@123',
		})

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.token).toBeTruthy()
		expect(res.body.Object.user.role).toBe('reader')
	})

	it('POST /api/auth/login should return 401 on invalid credentials', async () => {
		mockPrisma.user.findUnique.mockResolvedValueOnce(null)

		const res = await request.post('/api/auth/login').send({
			email: 'nope@example.com',
			password: 'Strong@123',
		})

		expect(res.status).toBe(401)
		expect(res.body.Success).toBe(false)
	})
})
