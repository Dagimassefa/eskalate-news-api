import type { Article, User } from '@prisma/client'

export function toPublicArticleListItem(
	article: Article,
	author?: Pick<User, 'name'>,
) {
	return {
		id: article.id,
		title: article.title,
		category: article.category,
		status: article.status,
		createdAt: article.createdAt,
		authorName: author?.name ?? null,
	}
}

export function toAuthorArticleListItem(article: Article) {
	return {
		id: article.id,
		title: article.title,
		category: article.category,
		status: article.status,
		createdAt: article.createdAt,
		deletedAt: article.deletedAt,
	}
}

export function toArticleDetail(article: Article, author?: Pick<User, 'name'>) {
	return {
		id: article.id,
		title: article.title,
		content: article.content,
		category: article.category,
		status: article.status,
		createdAt: article.createdAt,
		authorName: author?.name ?? null,
	}
}
