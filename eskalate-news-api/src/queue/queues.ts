import { Queue } from 'bullmq'
import { redisConnection } from './connection'
import { QUEUE_NAMES } from '../config/constants'

export const readLogQueue = new Queue(QUEUE_NAMES.READ_LOG, {
	connection: redisConnection,
})

export const dailyAnalyticsQueue = new Queue(QUEUE_NAMES.DAILY_ANALYTICS, {
	connection: redisConnection,
})
