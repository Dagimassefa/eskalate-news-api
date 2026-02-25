import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AnalyticsService } from '../../modules/analytics/analytics.service'
import { mockPrisma } from '../helpers/mockPrisma'

describe('Analytics processing', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('processDailyAnalytics should group ReadLog and upsert DailyAnalytics', async () => {
		mockPrisma.readLog.groupBy.mockResolvedValueOnce([
			{ articleId: 'art1', _count: { _all: 3 } },
			{ articleId: 'art2', _count: { _all: 7 } },
		])

		mockPrisma.dailyAnalytics.upsert.mockResolvedValue({} as any)

		const result = await AnalyticsService.processDailyAnalytics({
			dateUtc: '2026-02-25',
		})

		expect(result.articlesProcessed).toBe(2)
		expect(mockPrisma.dailyAnalytics.upsert).toHaveBeenCalledTimes(2)
	})
})
