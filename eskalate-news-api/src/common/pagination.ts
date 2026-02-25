import { Request } from 'express'
import {
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '../config/constants'

export interface PaginationParams {
	pageNumber: number
	pageSize: number
	skip: number
	take: number
}

export function extractPagination(req: Request): PaginationParams {
	const pageNumberRaw = req.query.page as string | undefined
	const pageSizeRaw = req.query.size as string | undefined

	let pageNumber = pageNumberRaw
		? parseInt(pageNumberRaw, 10)
		: DEFAULT_PAGE_NUMBER
	let pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : DEFAULT_PAGE_SIZE

	if (isNaN(pageNumber) || pageNumber < 1) {
		pageNumber = DEFAULT_PAGE_NUMBER
	}

	if (isNaN(pageSize) || pageSize < 1) {
		pageSize = DEFAULT_PAGE_SIZE
	}

	if (pageSize > MAX_PAGE_SIZE) {
		pageSize = MAX_PAGE_SIZE
	}

	const skip = (pageNumber - 1) * pageSize
	const take = pageSize

	return {
		pageNumber,
		pageSize,
		skip,
		take,
	}
}
