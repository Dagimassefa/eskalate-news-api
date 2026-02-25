import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { requireRole } from '../middleware/rbac'
import { validate } from '../middleware/validate'
import { AuthorController } from '../modules/author/author.controller'
import { authorDashboardSchema } from '../modules/author/author.schemas'

export const authorRoutes = Router()

authorRoutes.get(
	'/dashboard',
	authMiddleware,
	requireRole('author'),
	validate(authorDashboardSchema),
	AuthorController.dashboard,
)
