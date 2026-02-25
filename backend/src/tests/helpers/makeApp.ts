import express from 'express'
import request from 'supertest'
import { routes } from '../../routes'
import { errorHandler } from '../../middleware/errorHandler'
import { notFound } from '../../middleware/notFound'

export function makeApp() {
	const app = express()

	app.use(express.json())
	app.use('/api', routes)

	app.use(notFound)
	app.use(errorHandler)

	return {
		app,
		request: request(app),
	}
}
