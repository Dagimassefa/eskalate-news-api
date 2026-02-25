import { describe, it, expect, beforeEach, vi } from 'vitest'
import { makeApp } from '../helpers/makeApp'
import { mockPrisma } from '../helpers/mockPrisma'
import { makeAuthorToken } from '../helpers/tokens'
import '../../tests/setup'

describe('Author dashboard', () => {
	const { request } = makeApp()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('GET /api/author/dashboard should return articles with totalViews', async () => {
		mockPrisma.article.findMany.mockResolvedValueOnce([
			{
				id: 'art1',
				title: 'My Article',
				createdAt: new Date(),
				analytics: [{ viewCount: 5 }, { viewCount: 7 }],
			},
		])

		mockPrisma.article.count.mockResolvedValueOnce(1)

		const res = await request
			.get('/api/author/dashboard')
			.set('Authorization', `Bearer ${makeAuthorToken('a1')}`)

		expect(res.status).toBe(200)
		expect(res.body.Success).toBe(true)
		expect(res.body.Object.length).toBe(1)
		expect(res.body.Object[0].totalViews).toBe(12)
	})

	it('GET /api/author/dashboard should require author role', async () => {
		const res = await request.get('/api/author/dashboard')

		expect(res.status).toBe(401) // no token
		expect(res.body.Success).toBe(false)
	})
})
