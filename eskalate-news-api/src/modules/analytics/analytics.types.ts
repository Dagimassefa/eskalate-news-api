export interface ReadLogJobPayload {
	articleId: string
	readerId: string | null
	ip: string | null
	userAgent: string | null
}

export interface DailyAnalyticsJobPayload {
	// UTC date
	date: string
}
