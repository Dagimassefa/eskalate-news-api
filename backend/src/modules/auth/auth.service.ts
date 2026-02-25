
import { prisma } from '../../db/prisma'
import { AppError } from '../../common/errors'
import { HTTP_STATUS } from '../../common/httpStatus'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../config/constants'
import type { LoginInput, SignupInput } from './auth.types'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
import { Prisma } from '@prisma/client'

import { hashPassword, verifyPassword } from '../../utils/password'

function signToken(payload: { sub: string; role: 'author' | 'reader' }) {
	return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN })
}

export const AuthService = {
	async signup(input: SignupInput) {
		const passwordHash = await hashPassword(input.password)

		try {
			const user = await prisma.user.create({
				data: {
					name: input.name.trim(),
					email: input.email.toLowerCase().trim(),
					password: passwordHash,
					role: input.role,
				},
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
					createdAt: true,
				},
			})

			return {
				message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
				user,
			}
		} catch (err) {
			if (
				err instanceof Prisma.PrismaClientKnownRequestError &&
				err.code === 'P2002'
			) {
				throw new AppError('Conflict', HTTP_STATUS.CONFLICT, [
					ERROR_MESSAGES.DUPLICATE_EMAIL,
				])
			}

			throw err
		}
	},

	async login(input: LoginInput) {
		const user = await prisma.user.findUnique({
			where: { email: input.email.toLowerCase().trim() },
		})

		if (!user) {
			throw new AppError(
				ERROR_MESSAGES.UNAUTHORIZED,
				HTTP_STATUS.UNAUTHORIZED,
				[ERROR_MESSAGES.INVALID_CREDENTIALS],
			)
		}

		const ok = await verifyPassword(user.password, input.password)
		if (!ok) {
			throw new AppError(
				ERROR_MESSAGES.UNAUTHORIZED,
				HTTP_STATUS.UNAUTHORIZED,
				[ERROR_MESSAGES.INVALID_CREDENTIALS],
			)
		}

		const token = signToken({ sub: user.id, role: user.role })

		return {
			message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		}
	},
}
