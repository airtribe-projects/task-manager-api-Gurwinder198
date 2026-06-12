# Task Manager API

A small, production-style REST API for managing tasks, built with **Node.js + Express** and an
**in-memory** data store. The codebase uses a layered architecture (routes → controllers → services →
store), Zod request validation, custom error classes with a centralized error handler, and request
tracing — while staying intentionally simple.

> **Storage is in-memory.** All data is seeded from `task.json` on startup and resets every restart.
> No database is involved.

---

## Tech Stack

- **Node.js** (>= 18) + **Express 4**
- **Zod** for request validation
- **helmet** + **cors** for HTTP hardening
- **dotenv** for environment configuration
- **Jest** + **Supertest** for the engineering test suite
- **tap** + **Supertest** for the original assignment autograder
- **ESLint** + **Prettier**

---

## Project Structure

```
app.js                  # Entry module — exports a seeded Express app (no listen) for tests
server.js               # Starts the HTTP server + graceful shutdown
task.json               # Seed data (assignment-provided)
src/
  app.js                # createApp(store?) composition root
  routes/               # Endpoint definitions only
  controllers/          # Parse request → call service → send response
  services/             # Business logic (no HTTP awareness)
  data/                 # TaskStore (Map abstraction) + seed loader
  validations/          # Zod schemas
  middlewares/          # validate, error-handler, not-found, request-id, request-logger
  types/                # JSDoc typedefs
  utils/                # asyncHandler, response helpers, error classes
  constants/            # HTTP status, messages, defaults
tests/                  # Jest + Supertest suite
test/                   # Original tap autograder (do not modify)
```

**Layer responsibilities**

| Layer | Responsibility |
|---|---|
| Routes | Wire `path → validation → controller`. Nothing else. |
| Controllers | Parse the request, delegate to the service, send the response. `asyncHandler`-wrapped — no try/catch. |
| Services | Business logic and data manipulation via the store. No knowledge of `req`/`res`. |
| `TaskStore` | The only thing that touches the underlying `Map`. Swappable for a real DB later. |
| Middlewares | Validation, error handling, 404, request id, logging. |

---

## Setup

### Installation

```bash
npm install
```

### Environment variables

Copy the example file and adjust as needed (all values have sensible defaults):

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | `development` | Environment name |
| `LOG_LEVEL` | `info` | Reserved for log verbosity |

### Running locally

```bash
npm start      # node server.js
npm run dev    # nodemon (auto-restart on change)
```

The server logs `Server is listening on 3000` and exposes the endpoints below.

### Running tests

```bash
npm test         # original assignment autograder (tap)
npm run test:unit # engineering suite (Jest + Supertest)
```

### Lint & format

```bash
npm run lint
npm run format
```

---

## API Reference

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/tasks` | Create a task |
| GET | `/tasks` | List tasks (supports filtering, pagination, sorting) |
| GET | `/tasks/priority/:level` | List tasks with the given priority (`low`/`medium`/`high`) |
| GET | `/tasks/:id` | Get a task by id |
| PUT | `/tasks/:id` | Full update |
| PATCH | `/tasks/:id` | Partial update |
| DELETE | `/tasks/:id` | Delete a task |

### Task model

```jsonc
{
  "id": 1,                       // number (auto-increment)
  "title": "Set up environment",
  "description": "Install Node.js, npm, and git",
  "completed": true,
  "priority": "medium",          // "low" | "medium" | "high" (defaults to "medium")
  "createdAt": "2026-06-11T18:00:00.000Z",
  "updatedAt": "2026-06-11T18:00:00.000Z"
}
```

### Validation rules

- `title` — **required** on create, 3–100 characters.
- `description` — **required** on create, max 1000 characters.
- `completed` — **required boolean** on create.
- `priority` — optional, one of `low`/`medium`/`high`, defaults to `medium`.
- `PATCH` — all fields optional, but at least one must be provided.

### Query parameters for `GET /tasks`

| Param | Example | Notes |
|---|---|---|
| `completed` | `?completed=true` | Filter by completion (`true`/`false`) |
| `page` / `limit` | `?page=1&limit=10` | Paginate. Either one switches the response to a `{ data, meta }` envelope (see below). Missing values default to `page=1`, `limit=20`. |
| `sort` | `?sort=-createdAt` | One of `createdAt`, `updatedAt`, `title` (prefix `-` for descending) |

> **Response shape:** plain `GET /tasks` (and filter/sort without pagination) returns a **raw array**.
> As soon as `page` or `limit` is present, the response becomes a paginated envelope:
>
> ```json
> {
>   "data": [ /* tasks for this page */ ],
>   "meta": {
>     "total": 15,
>     "page": 1,
>     "limit": 5,
>     "totalPages": 3,
>     "hasNextPage": true,
>     "hasPrevPage": false
>   }
> }
> ```

---

## Examples

### Create a task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{ "title": "Write docs", "description": "Finish the README", "completed": false }'
```

**201 Created**

```json
{
  "id": 16,
  "title": "Write docs",
  "description": "Finish the README",
  "completed": false,
  "priority": "medium",
  "createdAt": "2026-06-11T18:05:00.000Z",
  "updatedAt": "2026-06-11T18:05:00.000Z"
}
```

### List tasks (filtered)

```bash
curl "http://localhost:3000/tasks?completed=false"
```

**200 OK**

```json
[
  {
    "id": 4,
    "title": "Install Express",
    "description": "Install Express",
    "completed": false,
    "priority": "medium",
    "createdAt": "2026-06-11T18:00:00.000Z",
    "updatedAt": "2026-06-11T18:00:00.000Z"
  }
]
```

### List tasks by priority

```bash
curl http://localhost:3000/tasks/priority/high
```

**200 OK** — raw array of tasks whose `priority` is `high`. An unknown level (e.g. `urgent`) returns **400**.

### Get a task

```bash
curl http://localhost:3000/tasks/1
```

**200 OK**

```json
{
  "id": 1,
  "title": "Set up environment",
  "description": "Install Node.js, npm, and git",
  "completed": true,
  "priority": "medium",
  "createdAt": "2026-06-11T18:00:00.000Z",
  "updatedAt": "2026-06-11T18:00:00.000Z"
}
```

### Update a task (PUT — full replace)

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{ "title": "Set up environment", "description": "Install tooling", "completed": true, "priority": "high" }'
```

**200 OK** — returns the updated task. `title`, `description`, and `completed` are required; `priority`
defaults to `medium` if omitted.

### Update a task (PATCH — partial)

```bash
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{ "completed": true }'
```

**200 OK** — returns the updated task.

### Delete a task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

**200 OK**

```json
{ "success": true, "message": "Task deleted" }
```

### Health check

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok" }
```

### Error responses

Not found — **404**:

```json
{ "success": false, "message": "Task not found" }
```

Validation failure — **400**:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "completed", "message": "Required" }
  ]
}
```

Every response also carries an `X-Request-Id` header for tracing.

---

## Design Decisions

- **Layered architecture with dependency injection.** `createApp(store)` is a composition root; the
  controller depends on a service, which depends on a `TaskStore`. Each layer is independently testable,
  and the store is injectable so tests run against isolated, freshly-seeded instances.
- **`TaskStore` abstraction over a `Map`.** No other module touches the raw collection, so replacing it
  with a database is a single-file change.
- **Zod for validation, surfaced through one middleware.** Schemas live in `validations/`; the `validate`
  middleware turns Zod errors into a consistent `{ success, message, errors }` body.
- **Custom errors + centralized handler.** `AppError` / `NotFoundError` / `ValidationError` carry their
  own status codes; the global error middleware is the only place that writes error responses. Controllers
  stay free of try/catch via `asyncHandler`.
- **Observability touches.** Per-request id (`X-Request-Id`) + a request logger, plus `helmet`, `cors`,
  and graceful shutdown on `SIGTERM`/`SIGINT`.

## Trade-offs

These choices were made deliberately to satisfy the assignment's grading contract
(`test/server.test.js`) while keeping the code clean:

1. **Plain JavaScript instead of TypeScript.** The grader runs the provided tap tests with no build step.
   To guarantee the submission can never fail on a compile/build issue, the app is written in CommonJS
   JavaScript with JSDoc typedefs for documentation, rather than TypeScript with a `dist/` build in the
   grading path.
2. **Raw success bodies (no `{ success, data }` envelope).** The autograder reads `response.body[0]` for
   lists and the task object directly for single reads, so success responses return the resource as-is.
   **Error** responses still use the `{ success, message, errors? }` envelope.
3. **`title`, `description`, and `completed` are all required on create** (PATCH stays partial). This
   matches the assignment's "required fields (title, description, completed)" wording, and `POST { title }`
   alone correctly returns 400.
4. **Numeric auto-increment ids seeded from `task.json`.** The grader asserts `id` is a number and that
   task `1` is "Set up environment", so ids are numeric rather than UUIDs.
5. **Two test runners.** `npm test` is reserved for the original tap autograder (the grading contract);
   `npm run test:unit` runs the Jest + Supertest engineering suite covering the same behavior.

## Possible Extensions (out of scope)

Persistence/database, authentication, the `/api` prefix with versioning, OpenAPI/Swagger docs, and CI.
