import { PrismaClient } from '@prisma/client'
import { env } from '../config/env'
import { logger } from '../common/logger'

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined
}

export const prisma =
	global.prisma ??
	new PrismaClient({
		log:
			env.NODE_ENV === 'development'
				? ['query', 'info', 'warn', 'error']
				: ['error'],
	})

if (env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

// shutdown
process.on('SIGINT', async () => {
	logger.info('Shutting down Prisma (SIGINT)')
	await prisma.$disconnect()
	process.exit(0)
})

process.on('SIGTERM', async () => {
	logger.info('Shutting down Prisma (SIGTERM)')
	await prisma.$disconnect()
	process.exit(0)
})
