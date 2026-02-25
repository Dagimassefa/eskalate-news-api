import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z
		.string()
		.default('4000')
		.transform((val) => parseInt(val, 10)),

	DATABASE_URL: z.string().min(1),

	JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
	JWT_EXPIRES_IN: z.string().default('24h'),

	REDIS_HOST: z.string().default('localhost'),
	REDIS_PORT: z
		.string()
		.default('6379')
		.transform((val) => parseInt(val, 10)),
	REDIS_PASSWORD: z.string().optional(),

	ANALYTICS_TIMEZONE: z.string().default('GMT'),
	READ_DEDUP_TTL_SECONDS: z
		.string()
		.default('60')
		.transform((val) => parseInt(val, 10)),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error('Invalid environment variables')
	console.error(parsed.error.format())
	process.exit(1)
}

export const env = parsed.data
