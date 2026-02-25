export function normalizeEmail(email: string) {
	return email.toLowerCase().trim()
}

export function normalizeName(name: string) {
	return name.trim().replace(/\s+/g, ' ')
}

export function normalizeCategory(category: string) {
	return category.trim()
}
