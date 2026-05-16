# base-quest-backend

REST API for **BaseQuest** — a gamified number-system learning app (binary, decimal, octal, hex, conversions). Built with Express, TypeScript, Prisma, and SQLite.

## Tech stack

- Node.js + TypeScript
- Express 4
- Prisma 5 ORM (SQLite by default)
- JWT auth (`jsonwebtoken` + `bcryptjs`)
- Zod for request validation

## Prerequisites

- Node.js 18+ and npm
- That's it — SQLite is bundled via Prisma, no external DB needed for local dev.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env from the template
cp .env.example .env

# 3. Generate the Prisma client and apply migrations
npm run prisma:migrate

# 4. (Optional) Seed the database with starter lessons / questions / achievements
npm run seed
```

### Environment variables

Defined in `.env` (see `.env.example`):

| Variable         | Description                                     | Default                   |
| ---------------- | ----------------------------------------------- | ------------------------- |
| `DATABASE_URL`   | Prisma datasource URL                           | `file:./dev.db` (SQLite)  |
| `JWT_SECRET`     | Secret used to sign auth tokens                 | _change before deploying_ |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`, `1h`)                | `7d`                      |
| `PORT`           | HTTP port the API listens on                    | `4000`                    |
| `CORS_ORIGIN`    | Allowed origin(s), comma-separated for multiple | `http://localhost:3000`   |

## Running the project

### Development (hot reload)

```bash
npm run dev
```

The API will be available at `http://localhost:4000`. Quick health check:

```bash
curl http://localhost:4000/health
# { "ok": true, "service": "base-quest-api" }
```

### Production build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs dist/index.js
```

## API surface

All routes are mounted in `src/index.ts`:

| Prefix           | Purpose                                |
| ---------------- | -------------------------------------- |
| `/auth`          | Register, login, current user          |
| `/student`       | Profile, XP, level, streak             |
| `/lessons`       | List lessons and track progress        |
| `/questions`     | Question bank (pre-test, post-test, practice) |
| `/quiz`          | Submit quiz attempts                   |
| `/game`          | Mini-game scores and XP                |
| `/achievements`  | List and unlock achievements           |
| `/health`        | Liveness check                         |

## Useful scripts

| Script                    | What it does                                  |
| ------------------------- | --------------------------------------------- |
| `npm run dev`             | Start the API with `ts-node-dev` hot reload   |
| `npm run build`           | Compile TypeScript to `dist/`                 |
| `npm start`               | Run the compiled server                       |
| `npm run prisma:generate` | Regenerate the Prisma client                  |
| `npm run prisma:migrate`  | Create / apply a dev migration                |
| `npm run prisma:deploy`   | Apply migrations in production (no prompts)   |
| `npm run seed`            | Seed the database via `prisma/seed.ts`        |

## Project structure

```
prisma/
  schema.prisma      # Data models (User, Lesson, Question, ...)
  migrations/        # Generated migrations
  seed.ts            # Seed data
src/
  index.ts           # Express app entry point
  routes/            # Route definitions per resource
  controllers/       # Request handlers
  middleware/        # Auth + error middleware
  lib/               # Prisma client, helpers
  utils/             # Shared utilities
```

## Resetting the local database

```bash
rm prisma/dev.db
npm run prisma:migrate
npm run seed
```
