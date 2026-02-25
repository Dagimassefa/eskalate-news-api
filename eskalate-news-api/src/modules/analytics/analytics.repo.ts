import { prisma } from '../../db/prisma'

export const AnalyticsRepo = {
	async createReadLog(data: {
		articleId: string
		readerId: string | null
		readAt?: Date
	}) {
		return prisma.readLog.create({
			data: {
				articleId: data.articleId,
				readerId: data.readerId,
				readAt: data.readAt ?? new Date(),
			},
		})
	},

	async aggregateReadsForUtcDate(dateUtc: string) {
		// dateUtc is YYYY-MM-DD in UTC
		const start = new Date(`${dateUtc}T00:00:00.000Z`)
		const end = new Date(`${dateUtc}T23:59:59.999Z`)

		const grouped = await prisma.readLog.groupBy({
			by: ['articleId'],
			where: {
				readAt: {
					gte: start,
					lte: end,
				},
			},
			_count: {
				_all: true,
			},
		})

		return grouped.map((g) => ({
			articleId: g.articleId,
			viewCount: g._count._all,
		}))
	},

	async upsertDailyAnalytics(data: {
		articleId: string
		dateUtc: string // YYYY-MM-DD
		viewCount: number
	}) {
		const dateOnly = new Date(`${data.dateUtc}T00:00:00.000Z`)

		return prisma.dailyAnalytics.upsert({
			where: {
				articleId_date: {
					articleId: data.articleId,
					date: dateOnly,
				},
			},
			update: {
				viewCount: data.viewCount,
			},
			create: {
				articleId: data.articleId,
				date: dateOnly,
				viewCount: data.viewCount,
			},
		})
	},
}
