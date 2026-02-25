import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { sendFailure } from '../common/response'
import { ERROR_MESSAGES } from '../config/constants'
import { HTTP_STATUS } from '../common/httpStatus'

export function validate(schema: ZodSchema) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse({
			body: req.body,
			query: req.query,
			params: req.params,
		})

		if (!result.success) {
			const errors = result.error.issues.map((issue) => issue.message)

			return sendFailure(
				res,
				ERROR_MESSAGES.VALIDATION_FAILED,
				errors,
				HTTP_STATUS.BAD_REQUEST,
			)
		}

		next()
	}
}
