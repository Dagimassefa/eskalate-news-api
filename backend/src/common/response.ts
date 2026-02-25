import type { Response } from 'express'

interface BaseResponse<T> {
	Success: boolean
	Message: string
	Object: T | null
	Errors: string[] | null
}

interface PaginatedResponse<T> {
	Success: boolean
	Message: string
	Object: T[]
	PageNumber: number
	PageSize: number
	TotalSize: number
	Errors: null
}

export function sendSuccess<T>(
	res: Response,
	message: string,
	object: T,
	statusCode = 200,
) {
	const response: BaseResponse<T> = {
		Success: true,
		Message: message,
		Object: object,
		Errors: null,
	}

	return res.status(statusCode).json(response)
}

export function sendFailure(
	res: Response,
	message: string,
	errors: string[],
	statusCode = 400,
) {
	const response: BaseResponse<null> = {
		Success: false,
		Message: message,
		Object: null,
		Errors: errors,
	}

	return res.status(statusCode).json(response)
}

export function sendPaginated<T>(
	res: Response,
	message: string,
	data: T[],
	pageNumber: number,
	pageSize: number,
	totalSize: number,
	statusCode = 200,
) {
	const response: PaginatedResponse<T> = {
		Success: true,
		Message: message,
		Object: data,
		PageNumber: pageNumber,
		PageSize: pageSize,
		TotalSize: totalSize,
		Errors: null,
	}

	return res.status(statusCode).json(response)
}
