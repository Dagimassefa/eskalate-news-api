import { z } from 'zod'
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '../../config/constants'

export const authorDashboardSchema = z.object({
	query: z.object({
		page: z
			.string()
			.optional()
			.default(String(DEFAULT_PAGE_NUMBER))
			.transform((v) => parseInt(v, 10))
			.refine((v) => !isNaN(v) && v >= 1, 'page must be >= 1'),

		size: z
			.string()
			.optional()
			.default(String(DEFAULT_PAGE_SIZE))
			.transform((v) => parseInt(v, 10))
			.refine(
				(v) => !isNaN(v) && v >= 1 && v <= MAX_PAGE_SIZE,
				`size must be 1..${MAX_PAGE_SIZE}`,
			),
	}),
})
