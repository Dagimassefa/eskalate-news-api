import { Worker } from 'bullmq'
import { redisConnection } from '../connection'
import { QUEUE_NAMES } from '../../config/constants'
import type { DailyAnalyticsJobPayload } from '../../modules/analytics/analytics.types'
import { AnalyticsService } from '../../modules/analytics/analytics.service'
import { logger } from '../../common/logger'

export const dailyAnalyticsWorker = new Worker<DailyAnalyticsJobPayload>(
	QUEUE_NAMES.DAILY_ANALYTICS,
	async (job) => {
		const { date } = job.data

		await AnalyticsService.processDailyAnalytics({ dateUtc: date })
	},
	{
		connection: redisConnection,
		concurrency: 2,
	},
)

dailyAnalyticsWorker.on('completed', (job) => {
	logger.info({ jobId: job.id }, 'daily analytics job completed')
})

dailyAnalyticsWorker.on('failed', (job, err) => {
	logger.error({ jobId: job?.id, err }, 'daily analytics job failed')
})
