import { Router } from 'express'
import { authModuleRoutes } from '../modules/auth/auth.routes'

export const authRoutes = Router()

authRoutes.use('/', authModuleRoutes)
