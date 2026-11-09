# PairUp Resume Screener

A lightweight HR workspace for comparing a candidate's resume with a job description. The React app, Express API, Groq integration, and MongoDB persistence run as one small TypeScript project. It does not include HR accounts or authentication.

## What it does

- Accepts candidate name, email, job role, job description, and resume text.
- Checks inputs in the browser and independently validates every API request with Zod.
- Requests a JSON-only evaluation from Groq and validates the response before saving it.
- Shows a 0–100 evidence-based match score, five matching skills, three gaps, and three interview questions.
- Saves one `Analysis` record per evaluation, without retaining resume text.
- Searches and filters history by candidate, email, role, score range, date, and page.
- Displays per-analysis token usage separately from shared Groq organization quota.
- Accepts pasted resume text or `.txt`/PDF resume uploads through Multer (up to 60 KB; 30,000 extracted characters maximum). PDFs are limited to 20 pages and must contain selectable text; scanned image-only PDFs are not OCR'd.

The score is an assistive signal, not a hiring decision. HR should verify evidence and apply consistent, job-related judgment.

## Run locally

Requirements: Node.js 22+, npm, MongoDB, and a Groq API key.

1. Copy `.env.example` to `.env` and add your Groq API key. Keep `.env` private.
2. Set `MONGODB_URI` to a reachable MongoDB instance.
3. Install and start the client and API:

   ```powershell
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`. The Vite client calls the API at `http://localhost:4000/api`.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | API/listener port | `4000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `GROQ_API_KEY` | Backend-only Groq credential | Required |
| `GROQ_MODEL` | Groq chat model | `llama-3.3-70b-versatile` |
| `CLIENT_URL` | Comma-separated explicit browser origin allowlist | `http://localhost:5173` |
| `VITE_API_URL` | Optional client API base URL | Dev: `http://localhost:4000/api`; production: same-origin `/api` |

Never put `GROQ_API_KEY` in a `VITE_` variable. In a single-origin deployment the browser and API share an origin; for a separately hosted client, set `CLIENT_URL` to its exact origin.

## API

- `POST /api/analysis` — multipart form fields `candidateName`, `candidateEmail`, `jobRole`, `jobDescription`, and one `resumeFile` (`.txt` or `.pdf`, maximum 60 KB). The API validates/extracts UTF-8 or PDF text, runs Groq, validates the output, persists the analysis, and returns it with sanitized usage.
- `GET /api/analysis` — filtered, newest-first history. Query parameters: `candidateName`, `candidateEmail`, `jobRole`, `minScore`, `maxScore`, `from`, `to`, `page`, `limit`.
- `GET /api/analysis/:id` — retrieve one analysis.
- `GET /api/health` — health check.

The `Analysis` collection stores candidate name/email, job role and description, validated evaluation fields, and timestamps. Email is normalized but not unique. Resume content is sent to Groq for processing, held only for the request, and not stored or logged.

## Build and TypeScript checks

```powershell
npm run typecheck
npm run build
```

The app is intentionally kept deployment-platform-neutral. Configure your hosting provider to install dependencies, run `npm run build`, and start the server with `npm run start --workspace server`. Set `WEB_DIST_DIR` to the built `client/dist` directory if it is not at the default relative location.

## Security notes

- Helmet, a configured CORS allowlist, request rate limiting, and bounded JSON bodies are enabled.
- Frontend checks are convenience only; backend Zod validation is authoritative.
- Resume and job-description text are treated as untrusted data. The model has no tools; output is validated before persistence.
- API errors do not include credentials, full resumes, provider responses, or stack traces.
- HR authentication is intentionally out of scope. Do not expose the unauthenticated service to an untrusted public audience without adding an appropriate access-control layer.
