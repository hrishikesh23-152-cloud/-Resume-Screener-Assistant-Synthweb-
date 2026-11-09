# AI usage and evaluation policy

## Purpose

Groq is used only to compare resume evidence with the job description supplied for one analysis and to return a structured report. The evaluation is an HR aid, not an automatic hiring recommendation or a substitute for human review.

## Evaluation and output

The model is instructed to assess role-related evidence using fixed weighted criteria: required skills (40%), relevant experience (30%), job-specific qualifications (15%), and demonstrated capabilities (15%). The report contains a 0–100 score, five matching skills, three gaps or missing-evidence areas, and three interview questions. Missing evidence is not treated as proof that a candidate lacks a skill. Protected characteristics and candidate name/email are not scoring evidence.

The backend requests JSON mode, parses the response, validates its exact shape with Zod, and permits one controlled regeneration when the response is malformed. Invalid output is neither returned nor saved. The model has no tools, and generated text is never executed.

## Prompt-injection safeguards

System instructions are separate from the JSON-serialized job description and resume. Both documents are untrusted content; embedded instructions cannot change the task or response schema. These measures are defense in depth, not a guarantee that a language model cannot be manipulated. Human review of source evidence remains necessary.

## Data handling

Candidate name, email, job role, job description, and extracted resume text are sent to the configured Groq API for the requested analysis. Plain-text and PDF files are held in memory; PDF text extraction is performed by the server, with uploads limited to 60 KB and 20 PDF pages. Resume text is not saved in MongoDB or logged by this application. The single `Analysis` collection stores the candidate name/email, job role and description, validated result, and timestamps. Configure Groq and MongoDB according to your organization's privacy, retention, and candidate-notice policies.

Do not submit information that you are not authorized to process. This application does not implement HR authentication, a retention scheduler, or candidate deletion workflows; restrict deployment access and establish an appropriate retention process for saved analyses.

## Usage and quota

The API returns token counts for the current model analysis separately from rate-limit quota reported by Groq. Remaining quota may be shared across the Groq organization and must not be presented as an individual HR allowance. Provider response headers are normalized before they are returned to the browser. Network/server/rate-limit failures have at most two retries; malformed output has at most one regeneration attempt.