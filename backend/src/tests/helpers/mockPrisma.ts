import { vi } from 'vitest'

export const mockPrisma = {
	user: {
		create: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		update: vi.fn(),
	},

	article: {
		create: vi.fn(),
		findMany: vi.fn(),
		findUnique: vi.fn(),
		findFirst: vi.fn(),
		update: vi.fn(),
		count: vi.fn(),
	},

	readLog: {
		create: vi.fn(),
		findMany: vi.fn(),
		groupBy: vi.fn(), 
	},

	dailyAnalytics: {
		upsert: vi.fn(),
	},

	$transaction: vi.fn(async (arg: any) => {
		if (typeof arg === 'function') return arg(mockPrisma as any)
		return Promise.all(arg)
	}),
	$disconnect: vi.fn(),
} as const
