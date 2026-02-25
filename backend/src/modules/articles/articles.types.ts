export type ArticleStatus = 'Draft' | 'Published'

export interface CreateArticleInput {
	title: string
	content: string
	category: string
	status?: ArticleStatus
	authorId: string
}

export interface UpdateArticleInput {
	title?: string
	content?: string
	category?: string
	status?: ArticleStatus
}

export interface ListFeedFilters {
	category?: string
	author?: string
	q?: string
}

export interface ListMyArticlesFilters {
	includeDeleted?: boolean
}
