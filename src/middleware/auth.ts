import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { sendFailure } from '../common/response'
import { ERROR_MESSAGES } from '../config/constants'
import { HTTP_STATUS } from '../common/httpStatus'

export interface AuthPayload {
	sub: string
	role: 'author' | 'reader'
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: AuthPayload
	}
}

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return sendFailure(
			res,
			ERROR_MESSAGES.UNAUTHORIZED,
			[ERROR_MESSAGES.UNAUTHORIZED],
			HTTP_STATUS.UNAUTHORIZED,
		)
	}

	const token = authHeader.split(' ')[1]

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload

		req.user = {
			sub: decoded.sub,
			role: decoded.role,
		}

		return next()
	} catch {
		return sendFailure(
			res,
			ERROR_MESSAGES.UNAUTHORIZED,
			['Invalid or expired token'],
			HTTP_STATUS.UNAUTHORIZED,
		)
	}
}
