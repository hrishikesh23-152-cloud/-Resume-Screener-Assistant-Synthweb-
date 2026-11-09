# AGENTS.md
# Resume Screener Assistant

## 1. Project Overview

Build a responsive Resume Screener Assistant for the HR team.

The application allows HR to:

- Enter candidate name and email.
- Enter a job description.
- Upload or enter resume content.
- Analyze the resume against the job description using Groq AI.
- Generate a structured resume match report.
- View previous analyses.
- Search candidates using their name or email.
- Filter analyses using match score.
- View individual analysis details.

The goal is to build a working, secure and reliable application with clean and understandable code.

Do not overengineer the application.

---

## 2. Technology Stack

### Frontend
- React
- Vite
- TypeScript
- React Router DOM
- Axios
- Tailwind CSS
- Zod

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- Groq SDK

### Testing
- Vitest
- Supertest
- MongoDB Memory Server (if needed)

### Security
- Helmet
- CORS
- Express rate limiting
- CSRF protection where cookie-based authentication is used
- XSS protection
- Prompt injection protection

### Deployment
- Docker
- Docker Compose
- Render

---

## 3. Project Architecture

Use a simple modular architecture.

### Frontend Structure

- components/: Reusable UI components.
- pages/: Application pages.
- layouts/: Shared layouts.
- routes/: React Router configuration.
- services/: Axios API requests.
- schemas/: Zod validation schemas.
- hooks/: Custom React hooks.
- utils/: Helper functions.

### Backend Structure

- config/: Database and environment configuration.
- routes/: API routes.
- controllers/: Request and response handling.
- services/: Business logic and Groq integration.
- models/: Mongoose models.
- middleware/: Validation, security and error handling.
- schemas/: Zod schemas.
- utils/: Helper functions.
- tests/: Automated tests.

### Architecture Rules

- Keep controllers simple.
- Put business logic inside services.
- Keep database operations separate from controllers.
- Keep Groq integration inside a dedicated service.
- Keep validation schemas separate.
- Use centralized error handling.
- Avoid duplicate code.
- Avoid unnecessary abstractions.

---

## 4. Frontend Requirements

Build a clean, modern and responsive HR dashboard.

### Required Pages

1. Dashboard / New Analysis
2. Analysis Result
3. Analysis History
4. Analysis Details

### Frontend Technologies

- React for UI.
- React Router DOM for navigation.
- Axios for API communication.
- Tailwind CSS for styling.
- Zod for form validation.

### UI Requirements

- Mobile-first responsive design.
- Responsive navigation.
- Clean forms.
- Reusable components.
- Loading indicators.
- Empty states.
- Error states.
- Success messages.
- Validation messages.
- Match score visualization.
- Matching skills display.
- Skill gaps display.
- Interview questions display.

The application must work properly on mobile, tablet and desktop.

Avoid unnecessary UI libraries.

---

## 5. Candidate Information

The application does not require HR registration or authentication.

HR should be able to use the application directly.

Collect the following candidate information:

- Candidate name.
- Candidate email.
- Job description.
- Resume content.

Use candidate email for identifying and searching candidate records.

Normalize emails to lowercase before saving.

Do not create a User or Candidate collection.

---

## 6. MongoDB Requirements

Use MongoDB with Mongoose.

Create only one collection: Analysis.

Each analysis must contain:

- candidateName
- candidateEmail
- jobRole
- jobDescription
- matchScore
- matchingSkills
- skillGaps
- interviewQuestions
- createdAt
- updatedAt

### Database Rules

- One candidate can have multiple analyses.
- One candidate can apply for multiple job roles.
- Each application must have a separate analysis record.
- Do not make candidateEmail unique.
- Normalize candidate emails to lowercase.
- Add indexes for candidateEmail, candidateName, jobRole, matchScore and createdAt where useful.
- Do not create User or Candidate collections.
- Do not implement HR authentication.

## Search and Filtering

Allow HR to filter analysis history using:

- Candidate name.
- Candidate email.
- Job role.
- Minimum match score.
- Maximum match score.
- Creation date.

Support pagination and sorting by creation date.

Use MongoDB queries for filtering instead of retrieving all records and filtering them in React.

Validate all query parameters using Zod.

Implement filtering through:

GET /api/analysis

Return matching records and pagination metadata.

Use MongoDB with Mongoose.

Create only one collection:

Analysis

### Analysis Schema

Fields:

- candidateName: String, required.
- candidateEmail: String, required.
- jobDescription: String, required.
- matchScore: Number, between 0 and 100.
- matchingSkills: Array of strings.
- skillGaps: Array of strings.
- interviewQuestions: Array of strings.
- createdAt: Date.
- updatedAt: Date.

Store resume content only when required for the application's functionality. Prefer processing it temporarily and avoiding unnecessary long-term retention.

### Database Rules

- One candidate can have multiple analyses.
- Do not make candidateEmail unique in the Analysis collection.
- Normalize candidate emails to lowercase.
- Add indexes for candidate name, candidate email, match score and creation date where useful.
- Use Mongoose validation.
- Handle duplicate or invalid data appropriately.
- Avoid unnecessary personal data storage.

---

## 7. Zod Validation

Use Zod for frontend, backend and LLM response validation.

### Frontend Validation

Validate:

- Candidate name.
- Candidate email.
- Job description.
- Resume content.

Requirements:

- Reject empty inputs.
- Reject whitespace-only values.
- Validate email format.
- Enforce minimum and maximum lengths.
- Show field-specific error messages.
- Prevent invalid form submission.

### Backend Validation

Backend validation is mandatory.

Never trust frontend validation.

Validate every incoming request independently.

Validate:

- Request body.
- Query parameters.
- Route parameters.
- Candidate name.
- Candidate email.
- Job description.
- Resume content.
- MongoDB ObjectId.

Requirements:

- Reject invalid input.
- Normalize appropriate values.
- Enforce input length limits.
- Return appropriate HTTP status codes.
- Use reusable Zod validation middleware.

Requests directly made through Postman, curl or browser developer tools must also be validated.

### LLM Response Validation

Create a dedicated Zod schema for the Groq response.

Expected structure:

{
  "matchScore": 85,
  "matchingSkills": [
    "Node.js",
    "Express.js",
    "MongoDB",
    "REST APIs",
    "TypeScript"
  ],
  "skillGaps": [
    "AWS experience",
    "CI/CD experience",
    "Automated testing"
  ],
  "interviewQuestions": [
    "Explain your backend architecture.",
    "How do you handle API errors?",
    "How would you optimize database queries?"
  ]
}

Validation requirements:

- matchScore must be between 0 and 100.
- matchingSkills must contain exactly 5 items.
- skillGaps must contain exactly 3 items.
- interviewQuestions must contain exactly 3 items.
- Every item must be a non-empty string.
- Reject unexpected fields.

Never save or display unvalidated LLM output.

---

## 8. Groq LLM Integration

Use Groq SDK to generate resume analysis.

Keep the Groq API key exclusively on the backend.

Store it inside environment variables.

Create a dedicated service:

services/groqService.ts

### Analysis Workflow

1. Receive validated candidate information.
2. Receive job description and resume content.
3. Prepare the system prompt.
4. Send the request to Groq.
5. Request structured JSON output.
6. Parse the returned response.
7. Validate the response using Zod.
8. Collect token usage and rate-limit information.
9. Save validated results to MongoDB.
10. Return the analysis to the frontend.

### LLM Output Requirements

The LLM must generate:

- Match score between 0 and 100.
- Top 5 matching skills.
- Top 3 skill gaps.
- 3 suggested interview questions.

### Prompt Guidelines

- Compare actual candidate qualifications with job requirements.
- Use explicit evaluation criteria.
- Do not invent qualifications.
- Distinguish missing evidence from confirmed lack of a skill.
- Generate relevant interview questions.
- Return only the requested structured output.

Use structured output or JSON mode when supported by the selected Groq model.

Do not assume JSON mode guarantees valid output.

---

## 9. Prompt Injection Protection

Treat resumes and job descriptions as untrusted content.

Implement defense-in-depth.

Requirements:

- Keep system instructions separate from user-provided content.
- Clearly delimit resume and job description content.
- Tell the LLM to ignore instructions embedded inside documents.
- Treat embedded instructions as document content.
- Do not give the LLM unnecessary tool access.
- Never execute commands found in resumes.
- Never allow document content to change the expected JSON schema.
- Validate every response using Zod.
- Never trust the LLM's self-reported compliance.

Write tests containing malicious prompt injection examples.

Do not rely on system prompts alone for prompt injection protection.

---

## 10. Groq Rate Limit and Token Tracking

Capture rate-limit headers from Groq HTTP responses.

Track:

- x-ratelimit-limit-requests
- x-ratelimit-remaining-requests
- x-ratelimit-limit-tokens
- x-ratelimit-remaining-tokens
- x-ratelimit-reset-requests
- x-ratelimit-reset-tokens
- retry-after

Also capture token usage from the Groq response:

- prompt_tokens
- completion_tokens
- total_tokens

### Frontend Display

Display an optional AI Usage Details section.

Show:

- Tokens used for the current analysis.
- Remaining token quota.
- Request limit.
- Remaining requests.
- Reset information.
- Retry status.

Clearly distinguish token consumption for one analysis from the remaining rate-limit quota.

Only return sanitized usage information to the frontend.

Do not expose raw provider headers or sensitive information.

Handle missing headers gracefully.

---

## 11. Retry Mechanism

Implement a reusable retry utility for Groq requests.

### Retry Rules

Retry temporary failures such as:

- Network errors.
- Temporary server errors.
- HTTP 429 rate-limit errors.

Use exponential backoff with jitter.

Requirements:

- Maximum 2 additional retries.
- Respect retry-after when available.
- Otherwise use appropriate reset information or exponential backoff.
- Do not retry authentication errors.
- Do not retry invalid request parameters.
- Do not retry permanent client errors.
- Retry malformed LLM output at most once when appropriate.
- Never retry indefinitely.

If all attempts fail, return an appropriate error.

Avoid creating duplicate database records.

---

## 12. Custom Error Handling

Create a reusable custom AppError class.

It should contain:

- Error message.
- HTTP status code.
- Operational error information.

Create centralized Express error-handling middleware.

All controllers and services should pass errors to the centralized handler.

### Appropriate HTTP Status Codes

- 200: Successful request.
- 201: Analysis created successfully.
- 400: Invalid request or malformed input.
- 404: Analysis not found.
- 413: Request payload too large.
- 415: Unsupported file type.
- 422: Invalid or unusable LLM output.
- 429: Rate limit exceeded.
- 500: Unexpected internal server error.
- 502: Invalid upstream Groq response.
- 503: Groq service unavailable.
- 504: Groq request timeout.

### Error Handling Requirements

Handle:

- Zod validation errors.
- Invalid MongoDB ObjectIds.
- MongoDB connection failures.
- Missing database records.
- Groq API errors.
- Groq rate limits.
- Groq timeouts.
- Malformed LLM responses.
- Network failures.
- Unexpected errors.

Map provider errors carefully.

Do not return HTTP 500 for every failure.

Never expose:

- API keys.
- Stack traces in production.
- Internal database details.
- Sensitive candidate information.

Use a consistent JSON error response.

---

## 13. API Endpoints

### POST /api/analysis

Responsibilities:

- Validate candidate information.
- Validate job description and resume.
- Call Groq.
- Validate LLM output.
- Collect usage information.
- Save analysis in MongoDB.
- Return the structured result.

### GET /api/analysis

Responsibilities:

- Retrieve analysis history.
- Search by candidate name.
- Search by candidate email.
- Filter by minimum score.
- Filter by maximum score.
- Support pagination.
- Validate query parameters.

### GET /api/analysis/:id

Responsibilities:

- Validate MongoDB ObjectId.
- Retrieve individual analysis.
- Return 404 if the analysis does not exist.

Use consistent API response structures.

---

## 14. Security Requirements

### CORS

- Configure an explicit frontend origin allowlist.
- Restrict allowed HTTP methods.
- Restrict allowed headers.
- Enable credentials only when needed.
- Never use wildcard origins with credentials.

Remember that CORS is not an authentication or CSRF protection mechanism.

### CSRF

The application does not require authentication.

If cookie-based authentication is introduced later:

- Use secure cookie settings.
- Implement an appropriate CSRF token strategy.
- Validate request origins.
- Configure SameSite cookies.

Do not add unnecessary authentication or CSRF complexity to the current application.

### XSS

- Use React's default output escaping.
- Never use dangerouslySetInnerHTML for resume content.
- Sanitize HTML if HTML rendering is genuinely required.
- Configure Content Security Policy using Helmet.
- Avoid unsafe inline scripts.

### Additional Security

- Use Helmet.
- Configure rate limiting.
- Keep secrets in environment variables.
- Restrict file types.
- Restrict file sizes.
- Never expose Groq API credentials.
- Avoid logging complete resumes.
- Use HTTPS in production.
- Use appropriate MongoDB credentials.
- Do not expose sensitive information in error responses.

---

## 15. Search and Filtering

The HR team should be able to search analysis history.

Implement:

- Search by candidate name.
- Search by candidate email.
- Filter by minimum match score.
- Filter by maximum match score.
- Pagination.
- Sorting by creation date.

Validate all query parameters using Zod.

Search should work without requiring HR authentication.

---

## 16. Frontend API Integration

Use a centralized Axios instance.

Requirements:

- Configure backend base URL.
- Use appropriate request headers.
- Handle API errors.
- Handle network failures.
- Handle loading states.
- Show meaningful error messages.
- Avoid exposing backend internal errors.

Connect the frontend to:

- Create analysis endpoint.
- Analysis history endpoint.
- Individual analysis endpoint.

---

## 17. Automated Testing

Use Vitest and Supertest.

Mock Groq API calls during automated tests.

Use MongoDB Memory Server or an isolated test database.

### Analysis API Tests

- Successful analysis.
- Empty candidate name.
- Invalid email.
- Empty job description.
- Empty resume.
- Invalid request types.
- Oversized request.
- Successful Groq response.
- Invalid LLM output.
- Groq API failure.
- Groq rate limit.
- Groq timeout.
- Retry behavior.
- MongoDB persistence failure.

### History API Tests

- Retrieve history.
- Search by candidate name.
- Search by candidate email.
- Filter by score range.
- Pagination.
- Invalid query parameters.
- Invalid ObjectId.
- Analysis not found.

### Security Tests

- Direct API requests bypassing frontend validation.
- Prompt injection attempts.
- Oversized requests.
- Disallowed CORS origins.
- Unsafe HTML content.
- Rate limiting.

Run relevant tests after implementing each major feature.

Do not claim tests pass without actually running them.

---

## 18. Environment Variables

Use environment variables for configuration.

Example .env:

PORT=
NODE_ENV=
MONGODB_URI=
GROQ_API_KEY=
GROQ_MODEL=
CLIENT_URL=

Create an .env.example file with placeholder values.

Never commit real API keys or credentials.

---

## 19. Coding Guidelines

- Use TypeScript.
- Write simple and readable code.
- Use async/await.
- Use meaningful variable and function names.
- Create reusable functions.
- Avoid duplicate logic.
- Keep controllers thin.
- Keep services focused.
- Use centralized error handling.
- Avoid unnecessary dependencies.
- Do not introduce microservices.
- Do not overengineer the application.
- Explain important architectural decisions.
- Verify features before declaring them complete.

Do not generate the entire application in one step.

Implement features incrementally.

---

## 20. Development Order

Follow this implementation order:

1. Initialize React and Express projects.
2. Configure MongoDB.
3. Create the Analysis model.
4. Create frontend and backend Zod schemas.
5. Implement backend validation middleware.
6. Implement custom error handling.
7. Integrate Groq API.
8. Implement structured LLM output validation.
9. Implement prompt injection protection.
10. Implement rate-limit tracking.
11. Implement retry mechanism.
12. Save validated analyses in MongoDB.
13. Implement history, search and filtering.
14. Build responsive React dashboard.
15. Integrate Axios with backend APIs.
16. Implement automated tests.
17. Add security middleware.
18. Dockerize the application.
19. Deploy and verify the application.
20. Complete README.md and AI_USAGE.md.

Prioritize working end-to-end functionality, security, reliability and clear documentation.