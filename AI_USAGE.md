# AI usage and evaluation policy

## Purpose

Groq compares the supplied resume evidence with the job description and returns a structured report. The evaluation is an HR aid, not an automatic hiring recommendation or substitute for human review.

## Evaluation and output

The model considers role-related evidence, required skills, relevant experience, job-specific qualifications, and demonstrated capabilities. The report contains a 0–100 score, five matching skills, three skill gaps or missing-evidence areas, and three interview questions. Missing evidence is not proof that a candidate lacks a skill.

The backend requests JSON mode, parses the response, and validates its exact shape with Zod. Invalid output triggers one regeneration; invalid output is never returned or saved. The model has no tools, and generated text is never executed.

The default model is `openai/gpt-oss-120b`. The previously configured `llama-3.3-70b-versatile` was deprecated by Groq on August 16, 2026.

## Prompt-injection safeguards

System instructions are separate from the JSON-serialized job description and resume. Both documents are untrusted content; embedded instructions cannot change the task or response schema. These measures are defense in depth, not a guarantee that a language model cannot be manipulated. Human review of source evidence remains necessary.

## Data handling

Candidate name and email, job role, job description, and extracted resume text are sent to the configured Groq API for the requested analysis. PDF files are held in memory; uploads are limited to 300 KB and 20 pages. Resume text is not saved or logged. The single MongoDB `Analysis` collection stores candidate name/email, role, job description, validated result, and timestamps. Candidate email is normalized to lowercase and is not unique.

Do not submit information that you are not authorized to process. This application does not implement HR authentication; restrict deployment access appropriately.

## Usage and quota

The API displays token counts for the current model analysis separately from the shared Groq organization rate-limit quota. Missing provider quota headers are shown as unavailable.
