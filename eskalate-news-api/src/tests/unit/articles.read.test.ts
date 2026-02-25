import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'
import '../../tests/setup'

describe('Article read tracking', () => {
	const { request } = makeApp()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('GET /api/articles/:id should return 404 if article is soft-deleted', async () => {
		mockPrisma.article.findUnique.mockResolvedValueOnce({
			id: 'art1',
			title: 'Deleted',
			content: 'x'.repeat(60),
			category: 'Tech',
			status: 'Published',
			authorId: 'a1',
			createdAt: new Date(),
			deletedAt: new Date(),
			author: { name: 'Author One' },
		})

		const res = await request.get('/api/articles/art1')

		expect(res.status).toBe(404)
		expect(res.body.Success).toBe(false)
		expect(res.body.Message).toBe('News article no longer available')
	})

	it('GET /api/articles/:id should return article and enqueue readlog for active article', async () => {
		mockPrisma.article.findUnique.mockResolvedValueOnce({
			id: 'art2',
			title: 'Active',
			content: 'x'.repeat(60),
			category: 'Tech',
			status: 'Published',
			authorId: 'a1',
			createdAt: new Date(),
			deletedAt: null,
			author: { name: 'Author One' },
		})

		const producer = await import('../../queue/producers/readlog.producer')
		vi.spyOn(producer, 'enqueueReadLog').mockResolvedValueOnce(
			undefined as any,
		)

		const res = await request.get('/api/articles/art2')

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.title).toBe('Active')
		expect(producer.enqueueReadLog).toHaveBeenCalledOnce()
	})
})
