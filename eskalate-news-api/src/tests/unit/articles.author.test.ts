import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'
import { makeAuthorToken } from '../helpers/tokens'
import '../../tests/setup'

describe('Author article lifecycle', () => {
	const { request } = makeApp()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('POST /api/articles should create article (author only)', async () => {
		mockPrisma.user.findUnique.mockResolvedValueOnce({
			id: 'a1',
			name: 'Author One',
			email: 'a1@example.com',
			password: 'hash',
			role: 'author',
			createdAt: new Date(),
		})

		mockPrisma.article.create.mockResolvedValueOnce({
			id: 'art1',
			title: 'Hello',
			content: 'x'.repeat(60),
			category: 'Tech',
			status: 'Draft',
			authorId: 'a1',
			createdAt: new Date(),
			deletedAt: null,
		})

		const res = await request
			.post('/api/articles')
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)
			.send({
				title: 'Hello',
				content: 'x'.repeat(60),
				category: 'Tech',
				status: 'Draft',
			})

		expect(res.status).toBe(201)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.authorId).toBe('a1')
	})

	it('PUT /api/articles/:id should forbid editing another author article', async () => {
		mockPrisma.article.findUnique.mockResolvedValueOnce({
			id: 'art2',
			title: 'Other',
			content: 'x'.repeat(60),
			category: 'Tech',
			status: 'Draft',
			authorId: 'someone-else',
			createdAt: new Date(),
			deletedAt: null,
			author: { name: 'Other Author' },
		})

		const res = await request
			.put('/api/articles/art2')
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)
			.send({ title: 'New Title' })

		expect(res.status).toBe(403)
		expect(res.body.Success).toBe(false)
		expect(res.body.Message).toBe('Forbidden')
	})

	it('DELETE /api/articles/:id should soft delete (set deletedAt)', async () => {
		mockPrisma.article.findUnique.mockResolvedValueOnce({
			id: 'art3',
			title: 'Mine',
			content: 'x'.repeat(60),
			category: 'Tech',
			status: 'Draft',
			authorId: 'a1',
			createdAt: new Date(),
			deletedAt: null,
			author: { name: 'Author One' },
		})

		const deletedAt = new Date()

		mockPrisma.article.update.mockResolvedValueOnce({
			id: 'art3',
			title: 'Mine',
			content: 'x'.repeat(60),
			category: 'Tech',
			status: 'Draft',
			authorId: 'a1',
			createdAt: new Date(),
			deletedAt,
		})

		const res = await request
			.delete('/api/articles/art3')
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.deletedAt).toBeTruthy()
	})
})
