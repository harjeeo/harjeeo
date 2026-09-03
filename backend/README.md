# Backend

Express + TypeScript API for the Jeeo AI chat platform.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY
```

Create the database and apply the schema:

```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

## Run

```bash
npm run dev     # tsx watch, http://localhost:4000
npm run build   # compile to dist/
npm start       # run compiled output
```

## API

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/register` | - | Create an account |
| `POST /api/auth/login` | - | Log in, returns a JWT |
| `GET /api/auth/me` | required | Current user profile |
| `GET /api/models` | required | List enabled AI models |
| `GET /api/chat/conversations` | required | List the user's conversations |
| `GET /api/chat/conversations/:id` | required | Get a conversation with its messages |
| `POST /api/chat/send` | required | Send a message; streams the assistant reply as SSE |
| `POST /api/admin/models/sync` | admin | Pull the current model catalog from OpenRouter into `ai_models` |

`ai_models` starts empty — call `POST /api/admin/models/sync` (with an admin
account) once `OPENROUTER_API_KEY` is set, so the free/paid model list stays
dynamic instead of hard-coded.
