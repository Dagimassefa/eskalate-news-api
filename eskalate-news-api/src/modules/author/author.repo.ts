import { prisma } from '../../db/prisma'

export const AuthorRepo = {
	async listDashboard(params: {
		authorId: string
		skip: number
		take: number
	}) {
		const where = {
			authorId: params.authorId,
			deletedAt: null as Date | null,
		}

		const [articles, total] = await Promise.all([
			prisma.article.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: params.skip,
				take: params.take,
				select: {
					id: true,
					title: true,
					createdAt: true,
					analytics: {
						select: { viewCount: true },
					},
				},
			}),
			prisma.article.count({ where }),
		])

		const items = articles.map((a) => ({
			id: a.id,
			title: a.title,
			createdAt: a.createdAt,
			totalViews: a.analytics.reduce((sum, x) => sum + x.viewCount, 0),
		}))

		return { items, total }
	},
}
