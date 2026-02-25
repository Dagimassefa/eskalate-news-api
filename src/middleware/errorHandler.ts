import type { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { AppError } from '../common/errors'
import { sendFailure } from '../common/response'
import { HTTP_STATUS } from '../common/httpStatus'
import { logger } from '../common/logger'

export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof AppError) {
		return sendFailure(res, err.message, err.errors, err.statusCode)
	}

	// Prisma known request errors\
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		// Unique constraint violation
		if (err.code === 'P2002') {
			return sendFailure(
				res,
				'Conflict',
				['Resource already exists'],
				HTTP_STATUS.CONFLICT,
			)
		}

		// Record not found
		if (err.code === 'P2025') {
			return sendFailure(
				res,
				'Not found',
				['Resource not found'],
				HTTP_STATUS.NOT_FOUND,
			)
		}
	}

	// Unknown error
	logger.error({ err }, 'Unhandled error')

	return sendFailure(
		res,
		'Internal Server Error',
		['Something went wrong'],
		HTTP_STATUS.INTERNAL_SERVER_ERROR,
	)
}
