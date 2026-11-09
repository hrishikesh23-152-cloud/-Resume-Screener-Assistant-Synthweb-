# Resume Screener Assistant

A small TypeScript React and Express application that accepts candidate name/email, a job role and description, and a PDF resume. It extracts selectable text, returns a structured report from Groq, and saves the candidate and validated report in MongoDB for later search. HR authentication is not included.

The report contains a 0–100 match score, five matching skills, three skill gaps, and three interview questions. Treat it as an aid for human review, not an automated hiring decision.

## Run locally

Requirements: Node.js 22+, npm, MongoDB, and a Groq API key.

1. Copy `.env.example` to `.env`; configure `MONGODB_URI` and set `GROQ_API_KEY`.
2. Install and start the application:

   ```powershell
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173`. The Vite client sends requests to `http://localhost:4000/api`.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | API listener port | `4000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/resume_screener` |
| `GROQ_API_KEY` | Backend-only Groq credential | Required |
| `GROQ_MODEL` | Groq chat model | `openai/gpt-oss-120b` |
| `CLIENT_URL` | Explicit browser origin allowlist | `http://localhost:5173` |
| `VITE_API_URL` | Optional client API base URL | Dev: `http://localhost:4000/api`; production: same-origin `/api` |

Never put `GROQ_API_KEY` in a `VITE_` variable. Set `CLIENT_URL` to the exact origin hosting the client.

## API

- `POST /api/analysis` — multipart fields `candidateName`, `candidateEmail`, `jobRole`, `jobDescription`, and one `resumeFile` PDF (300 KB maximum).
- `GET /api/analysis` — search history with optional `candidateName`, `candidateEmail`, `jobRole`, `minScore`, `maxScore`, `from`, `to`, `page`, and `limit` query parameters.
- `GET /api/analysis/:id` — retrieve an individual saved analysis.
- `GET /api/health` — health check.

The PDF is held in memory only for the request, must contain selectable text, and is limited to 20 pages and 30,000 extracted characters. Scanned image-only PDFs are not OCR'd. Resume content is not persisted; the single `Analysis` collection stores candidate name/email, role, job description, validated report, and timestamps. Candidate email is normalized to lowercase and is not unique.

## Checks

```powershell
npm run typecheck
npm run build
```

Helmet, an explicit CORS allowlist, rate limiting, backend Zod validation, PDF signature checking, and bounded upload size are enabled. Resume and job description text are untrusted model input; the API validates the exact output shape and never executes model output. Search and filtering are performed by MongoDB, not in the browser.
