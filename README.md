# Eskalate News API (A2SV Eskalate Backend Assessment)

A production-ready RESTful API built with **Node.js + TypeScript + PostgreSQL (Prisma)** where:

- **Authors** create/manage articles (Draft/Published) and can **soft delete** them.
- **Readers** (and guests) can read published news.
- A **queue-based analytics engine** records read events and aggregates them into **daily (UTC/GMT) view counts**.

Swagger UI is available at:

- `http://localhost:4000/docs`

## Requirements

- Node.js **20+** recommended (Node 20 LTS is the safest)
- Docker Desktop (for running Postgres/Redis easily)
- npm

## Environment variables

Copy the sample env file:

```bash
cp .env.example .env
```

Minimal required values:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REDIS_HOST`
- `REDIS_PORT`
- `READ_DEDUP_TTL_SECONDS`
- `PORT`

## Run with Docker (recommended)

This starts:

- PostgreSQL
- Redis
- API server
- Queue workers
- Daily scheduler

From the project root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

API:

- `http://localhost:4000`

Swagger:

- `http://localhost:4000/docs`

Stop:

```bash
docker compose -f docker/docker-compose.yml down
```

Reset DB data (removes the Postgres volume):

```bash
docker compose -f docker/docker-compose.yml down -v
```

## Run locally (API on your machine, DB/Redis in Docker)

### 1) Start Postgres + Redis

```bash
docker run --name eskalate-postgres -e POSTGRES_USER=eskalate -e POSTGRES_PASSWORD=eskalate -e POSTGRES_DB=eskalate_db -p 5432:5432 -d postgres:15
docker run --name eskalate-redis -p 6379:6379 -d redis:7
```

If you see a “container name already in use” message, it just means it is already running.

Check:

```bash
docker ps
```

### 2) Install deps

```bash
npm install
```

### 3) Prisma generate + migrate

```bash
npx prisma generate
npx prisma migrate dev
```

(Optional) seed:

```bash
npx prisma db seed
```

### 4) Start dev server

```bash
npm run dev
```

API:

- `http://localhost:4000`

Swagger:

- `http://localhost:4000/docs`

## Running tests

Tests are written with **Vitest** + **Supertest**, and the database layer is mocked (no real DB required for unit tests).

Run all tests:

```bash
npm run test
```

Run in watch mode:

```bash
npx vitest --watch
```

Run a single test file:

```bash
npx vitest src/tests/unit/auth.test.ts
```

If you run into TypeScript typing issues for Swagger packages:

```bash
npm i -D @types/swagger-ui-express @types/swagger-jsdoc openapi-types
```

## Quick manual API smoke test (curl)

### Signup (author)

```bash
curl -X POST http://localhost:4000/api/auth/signup \
-H "Content-Type: application/json" \
-d '{"name":"John Doe","email":"john@example.com","password":"Strong@123","role":"author"}'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"john@example.com","password":"Strong@123"}'
```

Copy the returned JWT and use it as `Bearer <token>`.

### Create article (author only)

```bash
curl -X POST http://localhost:4000/api/articles \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{"title":"Tech News","content":"This is a long content body that is definitely more than fifty characters long to pass validation.","category":"Tech","status":"Published"}'
```

### Public feed

```bash
curl http://localhost:4000/api/articles
```

### Read article (triggers ReadLog via queue)

```bash
curl http://localhost:4000/api/articles/<ARTICLE_ID>
```

### Soft delete (author only)

```bash
curl -X DELETE http://localhost:4000/api/articles/<ARTICLE_ID> \
-H "Authorization: Bearer <TOKEN>"
```

## Notes on “refresh spam” protection

To prevent a single user from refreshing the page and generating excessive `ReadLog` rows in a short time window:

- Read events are queued (non-blocking to the request/response cycle).
- The worker performs **Redis TTL deduplication**:
    - Logged-in users: `(userId + articleId)`
    - Guests: `(ipHash + articleId)`
- Uses an atomic Redis `SET key value NX EX <ttl>` pattern.
- If the key already exists, the read event is ignored until the TTL expires.

This reduces DB pressure and remains safe in multi-instance deployments.

## Project scripts

Common commands:

```bash
npm run dev
npm run build
npm run start
npm run test
```
