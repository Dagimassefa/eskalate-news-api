import type { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { sendSuccess } from '../../common/response'
import { HTTP_STATUS } from '../../common/httpStatus'

export const AuthController = {
	async signup(req: Request, res: Response, next: NextFunction) {
		try {
			const { name, email, password, role } = req.body as {
				name: string
				email: string
				password: string
				role: 'author' | 'reader'
			}

			const result = await AuthService.signup({
				name,
				email,
				password,
				role,
			})

			return sendSuccess(
				res,
				result.message,
				result.user,
				HTTP_STATUS.CREATED,
			)
		} catch (err) {
			next(err)
		}
	},

	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body as {
				email: string
				password: string
			}

			const result = await AuthService.login({ email, password })

			return sendSuccess(res, result.message, {
				token: result.token,
				user: result.user,
			})
		} catch (err) {
			next(err)
		}
	},
}
