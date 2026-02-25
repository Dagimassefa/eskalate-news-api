import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { articlesRoutes } from './articles.routes'
import { authorRoutes } from './author.routes'

export const routes = Router()

routes.use('/auth', authRoutes)
routes.use('/articles', articlesRoutes)
routes.use('/author', authorRoutes)