process.env.NODE_ENV = 'test'
process.env.PORT = process.env.PORT ?? '4001'
process.env.DATABASE_URL =
	process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test_jwt_secret_12345'
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h'

process.env.REDIS_HOST = process.env.REDIS_HOST ?? 'localhost'
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379'
process.env.READ_DEDUP_TTL_SECONDS = process.env.READ_DEDUP_TTL_SECONDS ?? '60'
