export const DEFAULT_PAGE_NUMBER = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

export const SUCCESS_MESSAGES = {
	CREATED: 'Resource created successfully',
	UPDATED: 'Resource updated successfully',
	DELETED: 'Resource deleted successfully',
	FETCHED: 'Resource fetched successfully',
	LOGIN_SUCCESS: 'Login successful',
	SIGNUP_SUCCESS: 'User registered successfully',
}

export const ERROR_MESSAGES = {
	UNAUTHORIZED: 'Unauthorized',
	FORBIDDEN: 'Forbidden',
	NOT_FOUND: 'Resource not found',
	ARTICLE_NOT_AVAILABLE: 'News article no longer available',
	VALIDATION_FAILED: 'Validation failed',
	DUPLICATE_EMAIL: 'Email already exists',
	INVALID_CREDENTIALS: 'Invalid email or password',
}

export const ROLES = {
	AUTHOR: 'author',
	READER: 'reader',
} as const

export const ARTICLE_STATUS = {
	DRAFT: 'Draft',
	PUBLISHED: 'Published',
} as const

export const QUEUE_NAMES = {
	READ_LOG: 'read-log-queue',
	DAILY_ANALYTICS: 'daily-analytics-queue',
}
