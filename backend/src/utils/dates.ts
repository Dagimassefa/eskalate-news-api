export function toUtcDateString(d: Date) {
	const yyyy = d.getUTCFullYear()
	const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
	const dd = String(d.getUTCDate()).padStart(2, '0')
	return `${yyyy}-${mm}-${dd}`
}

export function utcStartOfDay(dateUtc: string) {
	return new Date(`${dateUtc}T00:00:00.000Z`)
}

export function utcEndOfDay(dateUtc: string) {
	return new Date(`${dateUtc}T23:59:59.999Z`)
}
