import { vi } from 'vitest'
import { mockPrisma } from './helpers/mockPrisma'


vi.mock('../db/prisma', () => ({
	prisma: mockPrisma,
}))
