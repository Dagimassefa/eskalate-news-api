
import type { Request, Response, NextFunction } from 'express'
import { ArticlesService } from './articles.service'
import { sendPaginated, sendSuccess, sendFailure } from '../../common/response'
import { HTTP_STATUS } from '../../common/httpStatus'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../config/constants'
import {
	toArticleDetail,
	toAuthorArticleListItem,
	toPublicArticleListItem,
} from './articles.mapper'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'

type AuthPayload = { sub: string; role: 'author' | 'reader' }

function tryGetUserIdFromAuthHeader(req: Request): string | undefined {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) return undefined

	const token = authHeader.split(' ')[1]
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload
		return decoded.sub
	} catch {
		return undefined
	}
}


function normalizeStatus(status?: unknown): 'Draft' | 'Published' | undefined {
	if (typeof status !== 'string') return undefined
	const s = status.trim()
	if (s === 'Draft' || s === 'Published') return s
	if (s.toLowerCase() === 'draft') return 'Draft'
	if (s.toLowerCase() === 'published') return 'Published'
	return undefined
}

function requireUser(
	req: Request,
	res: Response,
): { sub: string; role: 'author' | 'reader' } | undefined {
	const u = (req as any).user as
		| { sub: string; role: 'author' | 'reader' }
		| undefined
	if (!u?.sub) {
		sendFailure(
			res,
			ERROR_MESSAGES.UNAUTHORIZED,
			[ERROR_MESSAGES.UNAUTHORIZED],
			HTTP_STATUS.UNAUTHORIZED,
		)
		return undefined
	}
	return u
}

export const ArticlesController = {
	async createArticle(req: Request, res: Response, next: NextFunction) {
		try {
			const user = requireUser(req, res)
			if (!user) return

			const authorId = user.sub
			const { title, content, category } = req.body as {
				title: string
				content: string
				category: string
				status?: unknown
			}

			const status = normalizeStatus((req.body as any)?.status)

			const article = await ArticlesService.create(authorId, {
				title,
				content,
				category,
				status,
			})

			return sendSuccess(
				res,
				SUCCESS_MESSAGES.CREATED,
				article,
				HTTP_STATUS.CREATED,
			)
		} catch (err) {
			next(err)
		}
	},

	async listMyArticles(req: Request, res: Response, next: NextFunction) {
		try {
			const user = requireUser(req, res)
			if (!user) return

			const authorId = user.sub
			const includeDeleted = req.query.includeDeleted === 'true'

			const result = await ArticlesService.listMyArticles(req, authorId, {
				includeDeleted,
			})

			const mapped = result.items.map((a) => toAuthorArticleListItem(a))

			return sendPaginated(
				res,
				SUCCESS_MESSAGES.FETCHED,
				mapped,
				result.pageNumber,
				result.pageSize,
				result.total,
			)
		} catch (err) {
			next(err)
		}
	},

	async updateArticle(req: Request, res: Response, next: NextFunction) {
		try {
			const user = requireUser(req, res)
			if (!user) return

			const authorId = user.sub
			const articleId = String(req.params.id)

			const { title, content, category } = req.body as {
				title?: string
				content?: string
				category?: string
				status?: unknown
			}

			const status = normalizeStatus((req.body as any)?.status)

			try {
				const updated = await ArticlesService.update(
					authorId,
					articleId,
					{
						title,
						content,
						category,
						status,
					},
				)

				return sendSuccess(res, SUCCESS_MESSAGES.UPDATED, updated)
			} catch (err: any) {
				if (
					err?.message === ERROR_MESSAGES.FORBIDDEN ||
					err?.name === 'ForbiddenError'
				) {
					return sendFailure(
						res,
						'Forbidden',
						['Forbidden'],
						HTTP_STATUS.FORBIDDEN,
					)
				}
				throw err
			}
		} catch (err) {
			next(err)
		}
	},

	async softDeleteArticle(req: Request, res: Response, next: NextFunction) {
		try {
			const user = requireUser(req, res)
			if (!user) return

			const authorId = user.sub
			const articleId = String(req.params.id)

			try {
				const deleted = await ArticlesService.softDelete(
					authorId,
					articleId,
				)

				return sendSuccess(res, SUCCESS_MESSAGES.DELETED, {
					id: deleted.id,
					deletedAt: deleted.deletedAt,
				})
			} catch (err: any) {
				if (
					err?.message === ERROR_MESSAGES.FORBIDDEN ||
					err?.name === 'ForbiddenError'
				) {
					return sendFailure(
						res,
						'Forbidden',
						['Forbidden'],
						HTTP_STATUS.FORBIDDEN,
					)
				}
				throw err
			}
		} catch (err) {
			next(err)
		}
	},

	async listPublishedFeed(req: Request, res: Response, next: NextFunction) {
		try {
			const category =
				typeof req.query.category === 'string'
					? req.query.category
					: undefined
			const author =
				typeof req.query.author === 'string'
					? req.query.author
					: undefined
			const q = typeof req.query.q === 'string' ? req.query.q : undefined

			const result = await ArticlesService.listPublishedFeed(req, {
				category,
				author,
				q,
			})

			const mapped = result.items.map((a) =>
				toPublicArticleListItem(a, a.author ?? undefined),
			)

			return sendPaginated(
				res,
				SUCCESS_MESSAGES.FETCHED,
				mapped,
				result.pageNumber,
				result.pageSize,
				result.total,
			)
		} catch (err) {
			next(err)
		}
	},

	async getArticleByIdAndTrackRead(
		req: Request,
		res: Response,
		next: NextFunction,
	) {
		try {
			const articleId = String(req.params.id)
			const maybeUserId = tryGetUserIdFromAuthHeader(req)

			const article = await ArticlesService.getByIdAndTrackRead({
				articleId,
				maybeUserId,
				ip: req.ip,
				userAgent: req.headers['user-agent'] ?? undefined,
			})

			return sendSuccess(
				res,
				SUCCESS_MESSAGES.FETCHED,
				toArticleDetail(article, article.author ?? undefined),
			)
		} catch (err: any) {
			if (err?.message === ERROR_MESSAGES.ARTICLE_NOT_AVAILABLE) {
				return sendFailure(
					res,
					ERROR_MESSAGES.ARTICLE_NOT_AVAILABLE,
					[ERROR_MESSAGES.ARTICLE_NOT_AVAILABLE],
					HTTP_STATUS.NOT_FOUND,
				)
			}
			next(err)
		}
	},
}
