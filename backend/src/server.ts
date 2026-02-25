import { app } from './app'
import { env } from './config/env'
import { logger } from './common/logger'

import { startWorkers } from './queue'
import { startScheduler } from './jobs/scheduler'

async function bootstrap() {
	try {
		app.listen(env.PORT, () => {
			logger.info({ port: env.PORT }, 'HTTP server listening')
		})

		await startWorkers()
		await startScheduler()
	} catch (err) {
		logger.error({ err }, 'Failed to start server')
		process.exit(1)
	}
}

void bootstrap()
