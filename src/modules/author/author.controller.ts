import type { Request, Response, NextFunction } from 'express'
import { AuthorService } from './author.service'
import { sendPaginated } from '../../common/response'
import { SUCCESS_MESSAGES } from '../../config/constants'

export const AuthorController = {
	async dashboard(req: Request, res: Response, next: NextFunction) {
		try {
			const authorId = req.user!.sub

			const result = await AuthorService.dashboard(req, authorId)

			return sendPaginated(
				res,
				SUCCESS_MESSAGES.FETCHED,
				result.items,
				result.pageNumber,
				result.pageSize,
				result.total,
			)
		} catch (err) {
			next(err)
		}
	},
}
