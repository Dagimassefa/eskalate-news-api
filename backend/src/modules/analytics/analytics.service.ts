
import { AnalyticsRepo } from './analytics.repo'
import { ArticlesRepo } from '../articles/articles.repo'
import { logger } from '../../common/logger'

export const AnalyticsService = {
	async recordReadLog(params: { articleId: string; readerId: string | null }) {
		const article = await ArticlesRepo.findMetaById(params.articleId)

		if (!article) {
			logger.warn(
				{ articleId: params.articleId, readerId: params.readerId },
				'Skipping ReadLog: article does not exist (stale job)',
			)
			return
		}

		if (article.deletedAt) {
			logger.debug(
				{ articleId: params.articleId, readerId: params.readerId },
				'Skipping ReadLog: article is soft-deleted',
			)
			return
		}

		await AnalyticsRepo.createReadLog({
			articleId: params.articleId,
			readerId: params.readerId,
		})
	},

	async processDailyAnalytics(params: { dateUtc: string }) {
		const grouped = await AnalyticsRepo.aggregateReadsForUtcDate(
			params.dateUtc,
		)

		await Promise.all(
			grouped.map((g) =>
				AnalyticsRepo.upsertDailyAnalytics({
					articleId: g.articleId,
					dateUtc: params.dateUtc,
					viewCount: g.viewCount,
				}),
			),
		)

		logger.info(
			{ dateUtc: params.dateUtc, articlesProcessed: grouped.length },
			'Daily analytics processed',
		)

		return { dateUtc: params.dateUtc, articlesProcessed: grouped.length }
	},
}