import { prisma } from '../../db/prisma'
import type { ArticleStatus } from '@prisma/client'

export const ArticlesRepo = {
	async create(data: {
		title: string
		content: string
		category: string
		status: ArticleStatus
		authorId: string
	}) {
		return prisma.article.create({
			data,
		})
	},

	async findById(id: string) {
		return prisma.article.findUnique({
			where: { id },
			include: {
				author: { select: { name: true } },
			},
		})
	},

	async findByIdForAuthor(id: string, authorId: string) {
		return prisma.article.findFirst({
			where: { id, authorId },
		})
	},

	async updateById(
		id: string,
		data: Partial<{
			title: string
			content: string
			category: string
			status: ArticleStatus
		}>,
	) {
		return prisma.article.update({
			where: { id },
			data,
		})
	},

	async softDeleteById(id: string) {
		return prisma.article.update({
			where: { id },
			data: { deletedAt: new Date() },
		})
	},

	async listPublishedFeed(params: {
		category?: string
		authorNameContains?: string
		q?: string
		skip: number
		take: number
	}) {
		const where = {
			status: 'Published' as const,
			deletedAt: null as Date | null,
			...(params.category ? { category: params.category } : {}),
			...(params.q
				? {
						title: {
							contains: params.q,
							mode: 'insensitive' as const,
						},
					}
				: {}),
			...(params.authorNameContains
				? {
						author: {
							name: {
								contains: params.authorNameContains,
								mode: 'insensitive' as const,
							},
						},
					}
				: {}),
		}

		const [items, total] = await Promise.all([
			prisma.article.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: params.skip,
				take: params.take,
				include: { author: { select: { name: true } } },
			}),
			prisma.article.count({ where }),
		])

		return { items, total }
	},

	async listMyArticles(params: {
		authorId: string
		includeDeleted: boolean
		skip: number
		take: number
	}) {
		const where = {
			authorId: params.authorId,
			...(params.includeDeleted
				? {}
				: { deletedAt: null as Date | null }),
		}

		const [items, total] = await Promise.all([
			prisma.article.findMany({
				where,
				orderBy: { createdAt: 'desc' },
				skip: params.skip,
				take: params.take,
			}),
			prisma.article.count({ where }),
		])

		return { items, total }
	},
}
