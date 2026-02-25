import { logger } from '@/common/logger'
let started = false

export async function startWorkers() {
	if (started) return
	started = true

	await import('./workers/readlog.worker')
	await import('./workers/dailyAnalytics.worker')

	logger.info('Queue workers started')
}
