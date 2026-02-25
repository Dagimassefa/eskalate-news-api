import { z } from 'zod'
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '../../config/constants'

const uuidParam = z.string().uuid('Invalid id format')

export const articleIdParamSchema = z.object({
	params: z.object({
		id: uuidParam,
	}),
})

export const createArticleSchema = z.object({
	body: z.object({
		title: z
			.string()
			.min(1, 'Title is required')
			.max(150, 'Title must be at most 150 characters'),
		content: z.string().min(50, 'Content must be at least 50 characters'),
		category: z.string().min(1, 'Category is required'),
		status: z.enum(['Draft', 'Published']).optional(),
	}),
})

export const updateArticleSchema = z.object({
	params: z.object({
		id: uuidParam,
	}),
	body: z
		.object({
			title: z
				.string()
				.min(1, 'Title must be at least 1 character')
				.max(150, 'Title must be at most 150 characters')
				.optional(),
			content: z
				.string()
				.min(50, 'Content must be at least 50 characters')
				.optional(),
			category: z.string().min(1, 'Category is required').optional(),
			status: z.enum(['Draft', 'Published']).optional(),
		})
		.refine((obj) => Object.keys(obj).length > 0, {
			message: 'At least one field is required',
		}),
})

export const listFeedSchema = z.object({
	query: z.object({
		category: z.string().min(1).optional(),
		author: z.string().min(1).optional(),
		q: z.string().min(1).optional(),

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

export const listMyArticlesSchema = z.object({
	query: z.object({
		includeDeleted: z
			.string()
			.optional()
			.transform((v) => v === 'true')
			.optional(),

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
