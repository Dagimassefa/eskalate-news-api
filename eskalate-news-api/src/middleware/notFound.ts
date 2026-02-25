import { Request, Response } from 'express'
import { sendFailure } from '../common/response'
import { ERROR_MESSAGES } from '../config/constants'
import { HTTP_STATUS } from '../common/httpStatus'

export function notFound(req: Request, res: Response) {
	return sendFailure(
		res,
		ERROR_MESSAGES.NOT_FOUND,
		[ERROR_MESSAGES.NOT_FOUND],
		HTTP_STATUS.NOT_FOUND,
	)
}
