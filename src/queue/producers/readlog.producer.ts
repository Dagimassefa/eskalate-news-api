import { readLogQueue } from '../queues'
import type { ReadLogJobPayload } from '../../modules/analytics/analytics.types'

export async function enqueueReadLog(payload: ReadLogJobPayload) {
	// Lightweight enqueue
	await readLogQueue.add('readlog.ingest', payload, {
		removeOnComplete: true,
		removeOnFail: 1000,
		attempts: 3,
		backoff: { type: 'exponential', delay: 500 },
	})
}
