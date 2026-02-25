import { Router } from 'express'
import { ArticlesController } from '../modules/articles/articles.controller'
import { authMiddleware } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import {
	createArticleSchema,
	updateArticleSchema,
	listFeedSchema,
	listMyArticlesSchema,
	articleIdParamSchema,
} from '../modules/articles/articles.schemas'

export const articlesRoutes = Router()

articlesRoutes.get(
	'/',
	validate(listFeedSchema),
	ArticlesController.listPublishedFeed,
)

articlesRoutes.get(
	'/:id',
	validate(articleIdParamSchema),
	ArticlesController.getArticleByIdAndTrackRead,
)

articlesRoutes.post(
	'/',
	authMiddleware,
	requireRole('author'),
	validate(createArticleSchema),
	ArticlesController.createArticle,
)

articlesRoutes.get(
	'/me',
	authMiddleware,
	requireRole('author'),
	validate(listMyArticlesSchema),
	ArticlesController.listMyArticles,
)

articlesRoutes.put(
	'/:id',
	authMiddleware,
	requireRole('author'),
	validate(updateArticleSchema),
	ArticlesController.updateArticle,
)

articlesRoutes.delete(
	'/:id',
	authMiddleware,
	requireRole('author'),
	validate(articleIdParamSchema),
	ArticlesController.softDeleteArticle,
)
