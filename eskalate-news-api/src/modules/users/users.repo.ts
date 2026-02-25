import type { User, UserRole } from '@prisma/client'
import { prisma } from '../../db/prisma'

export const UsersRepo = {
	async findByEmail(email: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { email: email.toLowerCase().trim() },
		})
	},

	async findById(id: string): Promise<User | null> {
		return prisma.user.findUnique({
			where: { id },
		})
	},

	async create(data: {
		name: string
		email: string
		password: string
		role: UserRole
	}): Promise<Pick<User, 'id' | 'name' | 'email' | 'role' | 'createdAt'>> {
		return prisma.user.create({
			data: {
				name: data.name.trim(),
				email: data.email.toLowerCase().trim(),
				password: data.password,
				role: data.role,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
		})
	},
}
