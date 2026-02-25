import type { Request } from 'express'
import { extractPagination } from '../../common/pagination'
import { AuthorRepo } from './author.repo'

export const AuthorService = {
	async dashboard(req: Request, authorId: string) {
		const { pageNumber, pageSize, skip, take } = extractPagination(req)

		const { items, total } = await AuthorRepo.listDashboard({
			authorId,
			skip,
			take,
		})

		return { items, total, pageNumber, pageSize }
	},
}
