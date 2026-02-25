import { vi } from 'vitest'

export const mockPrisma = {
	user: {
		findUnique: vi.fn(),
		create: vi.fn(),
	},
	article: {
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		count: vi.fn(),
	},
	readLog: {
		create: vi.fn(),
		groupBy: vi.fn(),
	},
	dailyAnalytics: {
		upsert: vi.fn(),
	},
}

vi.mock('../../db/prisma', () => {
	return {
		prisma: mockPrisma,
	}
})
