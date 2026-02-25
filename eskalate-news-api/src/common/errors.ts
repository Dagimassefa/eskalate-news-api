export class AppError extends Error {
	public readonly statusCode: number
	public readonly errors: string[]
	public readonly isOperational: boolean

	constructor(
		message: string,
		statusCode: number,
		errors: string[] = [],
		isOperational = true,
	) {
		super(message)

		this.statusCode = statusCode
		this.errors = errors.length ? errors : [message]
		this.isOperational = isOperational

		Object.setPrototypeOf(this, new.target.prototype)
		Error.captureStackTrace(this)
	}
}
