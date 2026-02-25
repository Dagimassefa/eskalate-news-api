import { Worker } from 'bullmq'
import { redisConnection } from '../connection'
import { QUEUE_NAMES } from '../../config/constants'
import type { ReadLogJobPayload } from '../../modules/analytics/analytics.types'
import { AnalyticsService } from '../../modules/analytics/analytics.service'
import { env } from '../../config/env'
import { logger } from '../../common/logger'
import crypto from 'crypto'

function sha256(input: string) {
	return crypto.createHash('sha256').update(input).digest('hex')
}

function buildDedupeKey(payload: ReadLogJobPayload) {
	if (payload.readerId) {
		return `read:uid:${payload.readerId}:aid:${payload.articleId}`
	}

	const ipHash = sha256(payload.ip ?? 'unknown-ip')
	return `read:guest:${ipHash}:aid:${payload.articleId}`
}

export const readLogWorker = new Worker<ReadLogJobPayload>(
	QUEUE_NAMES.READ_LOG,
	async (job) => {
		const payload = job.data

		const dedupeKey = buildDedupeKey(payload)
		const ttlSeconds = Math.max(1, env.READ_DEDUP_TTL_SECONDS)

		const setResult = await redisConnection.set(
			dedupeKey,
			'1',
			'EX',
			ttlSeconds,
			'NX',
		)

		if (setResult !== 'OK') {
			logger.debug(
				{
					dedupeKey,
					articleId: payload.articleId,
					readerId: payload.readerId,
				},
				'ReadLog deduped',
			)
			return
		}

		await AnalyticsService.recordReadLog({
			articleId: payload.articleId,
			readerId: payload.readerId,
		})
	},
	{
		connection: redisConnection,
		concurrency: 50,
	},
)

readLogWorker.on('completed', (job) => {
	logger.debug({ jobId: job.id }, 'readLog job completed')
})

readLogWorker.on('failed', (job, err) => {
	logger.error({ jobId: job?.id, err }, 'readLog job failed')
})
