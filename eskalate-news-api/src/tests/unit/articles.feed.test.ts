import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'
import '../../tests/setup'

describe('Public articles feed', () => {
	const { request } = makeApp()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('GET /api/articles should return only published & not deleted', async () => {
		mockPrisma.article.findMany.mockResolvedValueOnce([
			{
				id: 'art1',
				title: 'Tech News',
				content: 'x'.repeat(60),
				category: 'Tech',
				status: 'Published',
				authorId: 'a1',
				createdAt: new Date(),
				deletedAt: null,
				author: { name: 'Author One' },
			},
		])

		mockPrisma.article.count.mockResolvedValueOnce(1)

		const res = await request.get('/api/articles')

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.length).toBe(1)
		expect(res.body.Object[0].title).toBe('Tech News')
	})

	it('GET /api/articles should support pagination', async () => {
		mockPrisma.article.findMany.mockResolvedValueOnce([])
		mockPrisma.article.count.mockResolvedValueOnce(0)

		const res = await request.get('/api/articles?page=2&size=5')

		expect(res.status).toBe(200)
		expect(res.body.PageNumber).toBe(2)
		expect(res.body.PageSize).toBe(5)
	})
})
