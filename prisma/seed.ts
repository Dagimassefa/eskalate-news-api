import { PrismaClient, UserRole, ArticleStatus } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
	const passwordHash = await argon2.hash('Password@123')

	const author = await prisma.user.upsert({
		where: { email: 'author@example.com' },
		update: {},
		create: {
			name: 'Sample Author',
			email: 'author@example.com',
			password: passwordHash,
			role: UserRole.author,
		},
	})

	const reader = await prisma.user.upsert({
		where: { email: 'reader@example.com' },
		update: {},
		create: {
			name: 'Sample Reader',
			email: 'reader@example.com',
			password: passwordHash,
			role: UserRole.reader,
		},
	})

	await prisma.article.createMany({
		data: [
			{
				title: 'Tech: Building resilient APIs',
				content:
					'This is a sample published article content that is definitely longer than fifty characters to satisfy validation.',
				category: 'Tech',
				status: ArticleStatus.Published,
				authorId: author.id,
			},
			{
				title: 'Health: Why prevention matters',
				content:
					'This is another sample draft article content that is definitely longer than fifty characters to satisfy validation.',
				category: 'Health',
				status: ArticleStatus.Draft,
				authorId: author.id,
			},
		],
		skipDuplicates: true,
	})

	// Create a sample ReadLog 
	const anyPublished = await prisma.article.findFirst({
		where: { status: ArticleStatus.Published, deletedAt: null },
	})

	if (anyPublished) {
		await prisma.readLog.create({
			data: {
				articleId: anyPublished.id,
				readerId: reader.id,
			},
		})
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
