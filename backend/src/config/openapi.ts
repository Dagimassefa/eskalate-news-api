import type { OpenAPIV3 } from 'openapi-types'

export const openApiSpec: OpenAPIV3.Document = {
	openapi: '3.0.0',
	info: {
		title: 'Eskalate News API',
		version: '1.0.0',
		description:
			'A2SV Eskalate Backend Assessment API: Authors publish content, Readers consume it, and an Analytics Engine aggregates reads daily (UTC).',
	},
	servers: [{ url: 'http://localhost:4000/api' }],
	tags: [{ name: 'Auth' }, { name: 'Articles' }, { name: 'Author' }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas: {
			BaseResponse: {
				type: 'object',
				required: ['Success', 'Message', 'Object', 'Errors'],
				properties: {
					Success: { type: 'boolean' },
					Message: { type: 'string' },
					Object: { nullable: true },
					Errors: {
						nullable: true,
						type: 'array',
						items: { type: 'string' },
					},
				},
			},
			PaginatedResponse: {
				type: 'object',
				required: [
					'Success',
					'Message',
					'Object',
					'PageNumber',
					'PageSize',
					'TotalSize',
					'Errors',
				],
				properties: {
					Success: { type: 'boolean' },
					Message: { type: 'string' },
					Object: { type: 'array', items: {} },
					PageNumber: { type: 'integer', example: 1 },
					PageSize: { type: 'integer', example: 10 },
					TotalSize: { type: 'integer', example: 0 },
					Errors: { type: 'null' },
				},
			},

			Role: { type: 'string', enum: ['author', 'reader'] },
			ArticleStatus: { type: 'string', enum: ['Draft', 'Published'] },

			User: {
				type: 'object',
				required: ['id', 'name', 'email', 'role', 'createdAt'],
				properties: {
					id: { type: 'string', format: 'uuid' },
					name: { type: 'string', example: 'John Doe' },
					email: { type: 'string', format: 'email' },
					role: { $ref: '#/components/schemas/Role' },
					createdAt: { type: 'string', format: 'date-time' },
				},
			},

			Article: {
				type: 'object',
				required: [
					'id',
					'title',
					'content',
					'category',
					'status',
					'authorId',
					'createdAt',
					'deletedAt',
				],
				properties: {
					id: { type: 'string', format: 'uuid' },
					title: { type: 'string', minLength: 1, maxLength: 150 },
					content: { type: 'string', minLength: 50 },
					category: { type: 'string', example: 'Tech' },
					status: { $ref: '#/components/schemas/ArticleStatus' },
					authorId: { type: 'string', format: 'uuid' },
					createdAt: { type: 'string', format: 'date-time' },
					updatedAt: { type: 'string', format: 'date-time' },
					deletedAt: {
						type: 'string',
						format: 'date-time',
						nullable: true,
					},
				},
			},

			ArticleFeedItem: {
				type: 'object',
				required: [
					'id',
					'title',
					'category',
					'status',
					'createdAt',
					'authorName',
				],
				properties: {
					id: { type: 'string', format: 'uuid' },
					title: { type: 'string' },
					category: { type: 'string' },
					status: { $ref: '#/components/schemas/ArticleStatus' },
					createdAt: { type: 'string', format: 'date-time' },
					authorName: { type: 'string' },
				},
			},

			DashboardItem: {
				type: 'object',
				required: ['id', 'title', 'createdAt', 'totalViews'],
				properties: {
					id: { type: 'string', format: 'uuid' },
					title: { type: 'string' },
					createdAt: { type: 'string', format: 'date-time' },
					totalViews: { type: 'integer', example: 0 },
				},
			},

			SignupRequest: {
				type: 'object',
				required: ['name', 'email', 'password', 'role'],
				properties: {
					name: {
						type: 'string',
						example: 'John Doe',
						description: 'Only alphabets and spaces allowed.',
					},
					email: {
						type: 'string',
						format: 'email',
						example: 'john@example.com',
					},
					password: {
						type: 'string',
						example: 'Strong@123',
						description:
							'At least 8 chars, one uppercase, one lowercase, one number, one special character.',
					},
					role: { $ref: '#/components/schemas/Role' },
				},
			},

			LoginRequest: {
				type: 'object',
				required: ['email', 'password'],
				properties: {
					email: {
						type: 'string',
						format: 'email',
						example: 'john@example.com',
					},
					password: { type: 'string', example: 'Strong@123' },
				},
			},

			LoginResponseObject: {
				type: 'object',
				required: ['token', 'user'],
				properties: {
					token: { type: 'string' },
					user: { $ref: '#/components/schemas/User' },
				},
			},

			CreateArticleRequest: {
				type: 'object',
				required: ['title', 'content', 'category'],
				properties: {
					title: { type: 'string', minLength: 1, maxLength: 150 },
					content: { type: 'string', minLength: 50 },
					category: { type: 'string', example: 'Tech' },
					status: { $ref: '#/components/schemas/ArticleStatus' },
				},
			},

			UpdateArticleRequest: {
				type: 'object',
				properties: {
					title: { type: 'string', minLength: 1, maxLength: 150 },
					content: { type: 'string', minLength: 50 },
					category: { type: 'string' },
					status: { $ref: '#/components/schemas/ArticleStatus' },
				},
			},
		},
	},

	paths: {
		'/auth/signup': {
			post: {
				tags: ['Auth'],
				summary: 'Signup',
				description:
					'Register a new user. Password must be strong. Role must be author or reader. Duplicate email returns 409.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/SignupRequest',
							},
						},
					},
				},
				responses: {
					'201': {
						description: 'User registered',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'400': {
						description: 'Validation failed',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'409': {
						description: 'Duplicate email',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},
		},

		'/auth/login': {
			post: {
				tags: ['Auth'],
				summary: 'Login',
				description:
					'Validate credentials, return JWT containing sub (userId) + role. Token expires (e.g., 24h).',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/LoginRequest',
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Login successful',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'401': {
						description: 'Invalid credentials',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},
		},

		'/articles': {
			get: {
				tags: ['Articles'],
				summary: 'Public news feed',
				description:
					'Returns only Published articles that are not soft-deleted. Supports pagination and filters.',
				parameters: [
					{
						name: 'page',
						in: 'query',
						schema: { type: 'integer', default: 1, minimum: 1 },
					},
					{
						name: 'size',
						in: 'query',
						schema: {
							type: 'integer',
							default: 10,
							minimum: 1,
							maximum: 100,
						},
					},
					{
						name: 'category',
						in: 'query',
						schema: { type: 'string' },
						description: 'Exact category match',
					},
					{
						name: 'author',
						in: 'query',
						schema: { type: 'string' },
						description: 'Partial author name match',
					},
					{
						name: 'q',
						in: 'query',
						schema: { type: 'string' },
						description: 'Keyword search in title',
					},
				],
				responses: {
					'200': {
						description: 'Paginated feed',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/PaginatedResponse',
								},
							},
						},
					},
				},
			},

			post: {
				tags: ['Articles'],
				summary: 'Create article (Author only)',
				security: [{ bearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/CreateArticleRequest',
							},
						},
					},
				},
				responses: {
					'201': {
						description: 'Article created',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'403': {
						description: 'Forbidden (not an author)',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},
		},

		'/articles/me': {
			get: {
				tags: ['Articles'],
				summary: 'List my articles (Author only)',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'page',
						in: 'query',
						schema: { type: 'integer', default: 1, minimum: 1 },
					},
					{
						name: 'size',
						in: 'query',
						schema: {
							type: 'integer',
							default: 10,
							minimum: 1,
							maximum: 100,
						},
					},
					{
						name: 'includeDeleted',
						in: 'query',
						schema: { type: 'boolean', default: false },
						description: 'If true, include soft-deleted articles',
					},
				],
				responses: {
					'200': {
						description:
							'Paginated author article list (Draft + Published)',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/PaginatedResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'403': {
						description: 'Forbidden',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},
		},

		'/articles/{id}': {
			get: {
				tags: ['Articles'],
				summary: 'Read article (triggers ReadLog)',
				description:
					'Returns full article content for Published and not deleted. Every successful call creates a ReadLog (queued). If deleted, returns "News article no longer available".',
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: { type: 'string', format: 'uuid' },
					},
				],
				responses: {
					'200': {
						description: 'Article fetched',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'404': {
						description: 'Deleted / not available',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},

			put: {
				tags: ['Articles'],
				summary: 'Update article (Author only)',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: { type: 'string', format: 'uuid' },
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/UpdateArticleRequest',
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Article updated',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'403': {
						description: 'Forbidden (not owner author)',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'404': {
						description: 'Not found / deleted',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},

			delete: {
				tags: ['Articles'],
				summary: 'Soft delete article (Author only)',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: { type: 'string', format: 'uuid' },
					},
				],
				responses: {
					'200': {
						description: 'Soft deleted (sets deletedAt)',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'403': {
						description: 'Forbidden (not owner author)',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'404': {
						description: 'Not found',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},
		},

		'/author/dashboard': {
			get: {
				tags: ['Author'],
				summary: 'Author performance dashboard',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'page',
						in: 'query',
						schema: { type: 'integer', default: 1, minimum: 1 },
					},
					{
						name: 'size',
						in: 'query',
						schema: {
							type: 'integer',
							default: 10,
							minimum: 1,
							maximum: 100,
						},
					},
				],
				responses: {
					'200': {
						description:
							'Paginated list of author articles with TotalViews',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/PaginatedResponse',
								},
							},
						},
					},
					'401': {
						description: 'Unauthorized',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
					'403': {
						description: 'Forbidden',
						content: {
							'application/json': {
								schema: {
									$ref: '#/components/schemas/BaseResponse',
								},
							},
						},
					},
				},
			},
		},
	},
}
