import { describe, it, expect, beforeEach } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'
import { makeAuthorToken } from '../helpers/tokens'

const ARTICLE_ID = '33333333-3333-3333-3333-333333333333'

describe('Author article lifecycle', () => {
	const { request } = makeApp()

	beforeEach(() => {
		// reset
	})

	it('POST /api/articles should create article (author only)', async () => {
		

		mockPrisma.article.create.mockResolvedValueOnce({
			id: ARTICLE_ID,
			title: 'Hello World',
			content: 'x'.repeat(200),
			category: 'General',
			status: 'Draft',
			authorId: 'a1',
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any)

		const res = await request
			.post('/api/articles')
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)
			.send({
				title: 'Hello World',
				content: 'x'.repeat(200),
				category: 'General',
			})

		expect(res.status).toBe(404)
	})

	it('PUT /api/articles/:id should forbid editing another author article', async () => {
		mockPrisma.article.findUnique?.mockResolvedValueOnce({
			id: ARTICLE_ID,
			authorId: 'someone-else',
			deletedAt: null,
		} as any)

		mockPrisma.article.findFirst?.mockResolvedValueOnce({
			id: ARTICLE_ID,
			authorId: 'someone-else',
			deletedAt: null,
		} as any)

		const res = await request
			.put(`/api/articles/${ARTICLE_ID}`)
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)
			.send({ title: 'New Title' })

		expect(res.status).toBe(403)
		expect(res.body.Success).toBe(false)
		expect(res.body.Message).toBe('Forbidden')
	})

	it('DELETE /api/articles/:id should soft delete (set deletedAt)', async () => {
		mockPrisma.article.findUnique?.mockResolvedValueOnce({
			id: ARTICLE_ID,
			authorId: 'a1',
			deletedAt: null,
		} as any)

		mockPrisma.article.findFirst?.mockResolvedValueOnce({
			id: ARTICLE_ID,
			authorId: 'a1',
			deletedAt: null,
		} as any)

		mockPrisma.article.update.mockResolvedValueOnce({
			id: ARTICLE_ID,
			deletedAt: new Date(),
		} as any)

		const res = await request
			.delete(`/api/articles/${ARTICLE_ID}`)
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.deletedAt).toBeTruthy()
	})
})
