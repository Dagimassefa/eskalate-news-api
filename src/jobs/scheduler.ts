import { dailyAnalyticsQueue } from '../queue/queues'
import { logger } from '../common/logger'

let started = false

function utcDateString(d: Date) {
	const yyyy = d.getUTCFullYear()
	const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
	const dd = String(d.getUTCDate()).padStart(2, '0')
	return `${yyyy}-${mm}-${dd}`
}

export async function startScheduler() {
	if (started) return
	started = true

	// Runs every day at 00:05 UTC to aggregate yesterday by default
	const now = new Date()
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
	const date = utcDateString(yesterday)

	// Add a repeatable job daily at 00:05 UTC
	await dailyAnalyticsQueue.add(
		'analytics.daily',
		{ date },
		{
			repeat: { pattern: '5 0 * * *', tz: 'UTC' },
			removeOnComplete: true,
			removeOnFail: 50,
		},
	)

	logger.info('Daily analytics scheduler started (00:05 UTC)')
}
