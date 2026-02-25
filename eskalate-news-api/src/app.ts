import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { routes } from './routes'
import { notFound } from './middleware/notFound'
import { errorHandler } from './middleware/errorHandler'
import { env } from './config/env'
import { setupSwagger } from './config/swagger'

export const app = express()

app.use(helmet())

app.use(
	cors({
		origin: true,
		credentials: true,
	}),
)

app.use(express.json({ limit: '1mb' }))

if (env.NODE_ENV !== 'test') {
	app.use(morgan('dev'))
}

setupSwagger(app)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)
