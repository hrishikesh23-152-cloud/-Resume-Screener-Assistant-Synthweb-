# Resume Screener Assistant

An AI-powered resume screening application built with **React, TypeScript, Node.js, Express, MongoDB, and Groq**.

Upload a candidate's PDF resume, provide job details, and receive a structured AI-generated evaluation to assist HR teams with candidate review.

## Live Demo

- **Frontend:** https://resume-screener-bu8t.onrender.com
- **Backend:** https://resume-screener-synth.onrender.com
- **API Health:** https://resume-screener-synth.onrender.com/api/health

## Features

- PDF resume upload and text extraction.
- AI-powered resume and job description comparison.
- Match score (0–100).
- Five matching skills and three skill gaps.
- Three AI-generated interview questions.
- Structured LLM responses validated using Zod.
- Candidate analysis history stored in MongoDB.
- Search and filter previous analyses.
- Input validation, rate limiting, Helmet, and CORS protection.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB, Mongoose |
| AI | Groq SDK |
| Validation | Zod |
| PDF Processing | pdf-parse |
| Security | Helmet, CORS, Express Rate Limit |

## Project Structure

```text
resume-screener/
├── client/          # React frontend
├── server/          # Express backend
├── .agents/         # Agent instructions
├── node_modules/
├── package.json
├── package-lock.json
├── AGENTS.md
└── AI_USAGE.md
```

## Getting Started

**Requirements:** Node.js 22+, npm, MongoDB, and a Groq API key.

1. Clone the repository:

```bash
git clone <your-repository-url>
cd resume-screener
```

2. Create your environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/resume_screener
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
CLIENT_URL=http://localhost:5173
```

4. Install dependencies and start both applications:

```bash
npm install
npm run dev
```

5. Open the application:

```text
http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Backend health check |
| POST | `/api/analysis` | Analyze a resume |
| GET | `/api/analysis` | Search analysis history |
| GET | `/api/analysis/:id` | Retrieve an analysis |

## Deployment

The application is deployed on **Render** using separate frontend and backend services.

Configure the following backend environment variables:

- `MONGODB_URI`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `CLIENT_URL`
- `NODE_ENV`

Set `CLIENT_URL` to the frontend's actual origin.

The frontend uses the backend API URL:

```text
https://resume-screener-synth.onrender.com/api
```

Never expose backend secrets in frontend environment variables.

## Validation and Testing

Run TypeScript checks:

```bash
npm run typecheck
```

Build both applications:

```bash
npm run build
```

## Limitations

- Only PDF files containing selectable text are supported.
- Maximum PDF size: 300 KB.
- Maximum document length: 20 pages and 30,000 extracted characters.
- Scanned image-only PDFs are not supported.
- Resume files are processed in memory and are not permanently stored.
- Candidate details and validated analysis reports are stored in MongoDB.

**Disclaimer:** AI-generated evaluations are intended to assist human reviewers. They should not be used as the sole basis for hiring decisions.
