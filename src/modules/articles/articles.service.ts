import { ArticlesRepo } from './articles.repo'
import { AppError } from '../../common/errors'
import { HTTP_STATUS } from '../../common/httpStatus'
import { ERROR_MESSAGES, ARTICLE_STATUS } from '../../config/constants'
import type {
	CreateArticleInput,
	ListFeedFilters,
	ListMyArticlesFilters,
	UpdateArticleInput,
} from './articles.types'
import { extractPagination } from '../../common/pagination'
import type { Request } from 'express'
import { UsersService } from '../users/users.service'
import { enqueueReadLog } from '../../queue/producers/readlog.producer'

export const ArticlesService = {
	async create(
		authorId: string,
		input: Omit<CreateArticleInput, 'authorId'>,
	) {
		await UsersService.ensureUserIsAuthor(authorId)

		const status = (input.status ?? ARTICLE_STATUS.DRAFT) as
			| 'Draft'
			| 'Published'

		const article = await ArticlesRepo.create({
			title: input.title.trim(),
			content: input.content,
			category: input.category.trim(),
			status,
			authorId,
		})

		return article
	},

	async listPublishedFeed(req: Request, filters: ListFeedFilters) {
		const { pageNumber, pageSize, skip, take } = extractPagination(req)

		const { items, total } = await ArticlesRepo.listPublishedFeed({
			category: filters.category,
			authorNameContains: filters.author,
			q: filters.q,
			skip,
			take,
		})

		return { items, total, pageNumber, pageSize }
	},

	async listMyArticles(
		req: Request,
		authorId: string,
		filters: ListMyArticlesFilters,
	) {
		const { pageNumber, pageSize, skip, take } = extractPagination(req)

		const { items, total } = await ArticlesRepo.listMyArticles({
			authorId,
			includeDeleted: Boolean(filters.includeDeleted),
			skip,
			take,
		})

		return { items, total, pageNumber, pageSize }
	},

	async update(
		authorId: string,
		articleId: string,
		input: UpdateArticleInput,
	) {
		const existing = await ArticlesRepo.findById(articleId)

		if (!existing || existing.deletedAt) {
			throw new AppError(
				ERROR_MESSAGES.NOT_FOUND,
				HTTP_STATUS.NOT_FOUND,
				['Article not found'],
			)
		}

		if (existing.authorId !== authorId) {
			throw new AppError(
				ERROR_MESSAGES.FORBIDDEN,
				HTTP_STATUS.FORBIDDEN,
				[ERROR_MESSAGES.FORBIDDEN],
			)
		}

		const updated = await ArticlesRepo.updateById(articleId, {
			...(input.title !== undefined ? { title: input.title.trim() } : {}),
			...(input.content !== undefined ? { content: input.content } : {}),
			...(input.category !== undefined
				? { category: input.category.trim() }
				: {}),
			...(input.status !== undefined ? { status: input.status } : {}),
		})

		return updated
	},

	async softDelete(authorId: string, articleId: string) {
		const existing = await ArticlesRepo.findById(articleId)

		if (!existing) {
			throw new AppError(
				ERROR_MESSAGES.NOT_FOUND,
				HTTP_STATUS.NOT_FOUND,
				['Article not found'],
			)
		}

		if (existing.authorId !== authorId) {
			throw new AppError(
				ERROR_MESSAGES.FORBIDDEN,
				HTTP_STATUS.FORBIDDEN,
				[ERROR_MESSAGES.FORBIDDEN],
			)
		}

		const deleted = await ArticlesRepo.softDeleteById(articleId)
		return deleted
	},

	async getByIdAndTrackRead(params: {
		articleId: string
		maybeUserId?: string
		ip?: string
		userAgent?: string
	}) {
		const article = await ArticlesRepo.findById(params.articleId)

		if (!article || article.deletedAt) {
			throw new AppError(
				ERROR_MESSAGES.ARTICLE_NOT_AVAILABLE,
				HTTP_STATUS.NOT_FOUND,
				[ERROR_MESSAGES.ARTICLE_NOT_AVAILABLE],
			)
		}

		await enqueueReadLog({
			articleId: article.id,
			readerId: params.maybeUserId ?? null,
			ip: params.ip ?? null,
			userAgent: params.userAgent ?? null,
		})

		return article
	},
}
