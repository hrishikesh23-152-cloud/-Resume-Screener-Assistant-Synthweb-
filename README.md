# Resume Screener Assistant

A small TypeScript React and Express application that accepts a job role, job description, and PDF resume, extracts selectable text from the PDF, and returns a structured resume match report from Groq. It has no database, resume history, or HR authentication.

The report contains a 0–100 match score, five matching skills, three skill gaps, and three interview questions. Treat it as an aid for human review, not an automated hiring decision.

## Run locally

Requirements: Node.js 22+, npm, and a Groq API key.

1. Copy `.env.example` to `.env` and set `GROQ_API_KEY`.
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
| `GROQ_API_KEY` | Backend-only Groq credential | Required |
| `GROQ_MODEL` | Groq chat model | `llama-3.3-70b-versatile` |
| `CLIENT_URL` | Explicit browser origin allowlist | `http://localhost:5173` |
| `VITE_API_URL` | Optional client API base URL | Dev: `http://localhost:4000/api`; production: same-origin `/api` |

Never put `GROQ_API_KEY` in a `VITE_` variable. Set `CLIENT_URL` to the exact origin hosting the client.

## API

- `POST /api/analysis` — multipart fields `jobRole`, `jobDescription`, and one `resumeFile` PDF (300 KB maximum).
- `GET /api/health` — health check.

The PDF is held in memory only for the request, must contain selectable text, and is limited to 20 pages and 30,000 extracted characters. Scanned image-only PDFs are not OCR'd. The application does not persist the resume or analysis.

## Checks

```powershell
npm run typecheck
npm run build
```

Helmet, an explicit CORS allowlist, rate limiting, backend Zod validation, PDF signature checking, and bounded upload size are enabled. Resume and job description text are untrusted model input; the API validates the exact output shape and never executes model output.
