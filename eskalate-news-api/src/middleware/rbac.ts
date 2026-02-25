import { Request, Response, NextFunction } from 'express'
import { sendFailure } from '../common/response'
import { ERROR_MESSAGES } from '../config/constants'
import { HTTP_STATUS } from '../common/httpStatus'

type Role = 'author' | 'reader'

export function requireRole(...roles: Role[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return sendFailure(
				res,
				ERROR_MESSAGES.UNAUTHORIZED,
				[ERROR_MESSAGES.UNAUTHORIZED],
				HTTP_STATUS.UNAUTHORIZED,
			)
		}

		if (!roles.includes(req.user.role)) {
			return sendFailure(
				res,
				ERROR_MESSAGES.FORBIDDEN,
				[ERROR_MESSAGES.FORBIDDEN],
				HTTP_STATUS.FORBIDDEN,
			)
		}

		return next()
	}
}
