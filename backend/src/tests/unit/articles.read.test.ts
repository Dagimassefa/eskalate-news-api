import { describe, it, expect, beforeEach } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'

const SOFT_DELETED_ID = '11111111-1111-1111-1111-111111111111'
const ACTIVE_ID = '22222222-2222-2222-2222-222222222222'

describe('Article read tracking', () => {
	const { request } = makeApp()

	beforeEach(() => {
		// reset
	})

	it('GET /api/articles/:id should return 404 if article is soft-deleted', async () => {
		mockPrisma.article.findUnique?.mockResolvedValueOnce({
			id: SOFT_DELETED_ID,
			title: 'Deleted',
			content: '...',
			category: 'Tech',
			status: 'Published',
			deletedAt: new Date(),
			authorId: 'a1',
			author: { id: 'a1', name: 'Author', email: 'a@a.com' },
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any)

		mockPrisma.article.findFirst?.mockResolvedValueOnce({
			id: SOFT_DELETED_ID,
			title: 'Deleted',
			content: '...',
			category: 'Tech',
			status: 'Published',
			deletedAt: new Date(),
			authorId: 'a1',
			author: { id: 'a1', name: 'Author', email: 'a@a.com' },
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any)

		const res = await request.get(`/api/articles/${SOFT_DELETED_ID}`)

		expect(res.status).toBe(404)
		expect(res.body.Success).toBe(false)
		expect(res.body.Message).toBe('News article no longer available')
	})

	it('GET /api/articles/:id should return article for active article', async () => {
		const activeArticle = {
			id: ACTIVE_ID,
			title: 'Active',
			content: '...',
			category: 'Tech',
			status: 'Published',
			deletedAt: null,
			authorId: 'a1',
			author: { id: 'a1', name: 'Author', email: 'a@a.com' },
			createdAt: new Date(),
			updatedAt: new Date(),
		}

		mockPrisma.article.findUnique?.mockResolvedValueOnce(
			activeArticle as any,
		)
		mockPrisma.article.findFirst?.mockResolvedValueOnce(
			activeArticle as any,
		)

		const res = await request.get(`/api/articles/${ACTIVE_ID}`)

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.title).toBe('Active')
	})
})
