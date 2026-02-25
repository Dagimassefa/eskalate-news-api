import type { User } from '@prisma/client'
import { UsersRepo } from './users.repo'
import { AppError } from '../../common/errors'
import { HTTP_STATUS } from '../../common/httpStatus'
import { ERROR_MESSAGES } from '../../config/constants'

export const UsersService = {
	async getUserByIdOrFail(id: string): Promise<User> {
		const user = await UsersRepo.findById(id)

		if (!user) {
			throw new AppError(
				ERROR_MESSAGES.NOT_FOUND,
				HTTP_STATUS.NOT_FOUND,
				['User not found'],
			)
		}

		return user
	},

	async ensureUserIsAuthor(id: string): Promise<User> {
		const user = await this.getUserByIdOrFail(id)

		if (user.role !== 'author') {
			throw new AppError(
				ERROR_MESSAGES.FORBIDDEN,
				HTTP_STATUS.FORBIDDEN,
				[ERROR_MESSAGES.FORBIDDEN],
			)
		}

		return user
	},
}
