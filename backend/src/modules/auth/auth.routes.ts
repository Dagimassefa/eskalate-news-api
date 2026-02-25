import { Router } from 'express'
import { AuthController } from './auth.controller'
import { validate } from '../../middleware/validate'
import { signupSchema, loginSchema } from './auth.schemas'

export const authModuleRoutes = Router()

authModuleRoutes.post('/signup', validate(signupSchema), AuthController.signup)

authModuleRoutes.post('/login', validate(loginSchema), AuthController.login)
