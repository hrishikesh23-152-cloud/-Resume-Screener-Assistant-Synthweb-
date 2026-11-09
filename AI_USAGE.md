# AI usage and evaluation policy

## Purpose

Groq compares the supplied resume evidence with the job description and returns a structured report. The evaluation is an HR aid, not an automatic hiring recommendation or substitute for human review.

## Evaluation and output

The model considers role-related evidence, required skills, relevant experience, job-specific qualifications, and demonstrated capabilities. The report contains a 0–100 score, five matching skills, three skill gaps or missing-evidence areas, and three interview questions. Missing evidence is not proof that a candidate lacks a skill.

The backend requests JSON mode, parses the response, and validates its exact shape with Zod. Invalid output is not returned. The model has no tools, and generated text is never executed.

## Prompt-injection safeguards

System instructions are separate from the JSON-serialized job description and resume. Both documents are untrusted content; embedded instructions cannot change the task or response schema. These measures are defense in depth, not a guarantee that a language model cannot be manipulated. Human review of source evidence remains necessary.

## Data handling

The job role, job description, and extracted resume text are sent to the configured Groq API for the requested analysis. PDF files are held in memory; uploads are limited to 300 KB and 20 pages. Resume text is not saved or logged, and this first version has no analysis history or database.

Do not submit information that you are not authorized to process. This application does not implement HR authentication; restrict deployment access appropriately.

## Usage and quota

This first version does not expose token counts or provider quota headers to the browser. Configure and monitor Groq usage in the provider account.
