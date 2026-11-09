import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { analysisFormSchema, MAX_RESUME_LENGTH } from "../schemas/analysisForm.js";
import { createAnalysis, getErrorMessage } from "../services/api.js";

const emptyForm = {
  candidateName: "",
  candidateEmail: "",
  jobRole: "",
  jobDescription: "",
  resumeText: "",
};

export default function DashboardPage() {
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (field: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: "" }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const parsed = analysisFormSchema.safeParse(form);
    if (!parsed.success) {
      setFieldErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      if (!form.resumeText.trim()) {
        setFieldErrors((current) => ({ ...current, resumeText: "Resume is required" }));
      }
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const file =
        resumeFile ??
        new File([parsed.data.resumeText], "resume.txt", { type: "text/plain" });
      const created = await createAnalysis({ ...parsed.data, resumeFile: file });
      navigate(`/analysis/${created.analysis.id}`, { state: { usage: created.usage } });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt") || file.size > 60_000) {
      setError("Choose a plain-text .txt resume file no larger than 60 KB.");
      event.currentTarget.value = "";
      return;
    }
    try {
      const text = await file.text();
      if (text.length > MAX_RESUME_LENGTH) {
        setError("This resume is too long. Keep it under 30,000 characters.");
        setResumeFile(null);
        return;
      }
      if (text.trim().length < 20) {
        setError("The uploaded resume must contain at least 20 characters.");
        setResumeFile(null);
        return;
      }
      updateField("resumeText", text);
      setResumeFile(file);
      setError("");
    } catch {
      setError("This file could not be read. Paste the resume text instead.");
    }
  }

  return (
    <div className="dashboard-grid">
      <section className="intro-column">
        <p className="eyebrow">TALENT WORKSPACE</p>
        <h1>Find the right fit,<br /><span>with more context.</span></h1>
        <p className="intro-copy">
          Compare a candidate’s experience to the role, surface evidence, and prepare thoughtful
          follow-up questions.
        </p>
        <div className="steps-card">
          <p className="eyebrow">A SIMPLE WORKFLOW</p>
          <ol className="steps-list">
            <li><span>01</span><div><strong>Add role details</strong><small>Share the requirements that matter</small></div></li>
            <li><span>02</span><div><strong>Include candidate experience</strong><small>Paste or upload a plain-text resume</small></div></li>
            <li><span>03</span><div><strong>Review the evidence</strong><small>Use the score as a starting point</small></div></li>
          </ol>
        </div>
        <p className="privacy-note"><span>●</span> Resume text is processed for analysis and not stored in history.</p>
      </section>

      <section className="form-panel panel">
        <div className="form-heading">
          <div>
            <p className="eyebrow">NEW EVALUATION</p>
            <h2>Start an analysis</h2>
          </div>
          <span className="private-badge">Private workspace</span>
        </div>
        <form onSubmit={onSubmit} noValidate>
          <div className="form-row">
            <Field label="Candidate name" error={fieldErrors.candidateName}>
              <input
                autoComplete="name"
                value={form.candidateName}
                onChange={(event) => updateField("candidateName", event.target.value)}
                placeholder="e.g. Alex Morgan"
                aria-invalid={Boolean(fieldErrors.candidateName)}
              />
            </Field>
            <Field label="Candidate email" error={fieldErrors.candidateEmail}>
              <input
                type="email"
                autoComplete="email"
                value={form.candidateEmail}
                onChange={(event) => updateField("candidateEmail", event.target.value)}
                placeholder="alex@example.com"
                aria-invalid={Boolean(fieldErrors.candidateEmail)}
              />
            </Field>
          </div>
          <Field label="Job role" error={fieldErrors.jobRole}>
            <input
              value={form.jobRole}
              onChange={(event) => updateField("jobRole", event.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              aria-invalid={Boolean(fieldErrors.jobRole)}
            />
          </Field>
          <Field label="Job description" hint="Include the responsibilities and qualifications you want to evaluate." error={fieldErrors.jobDescription}>
            <textarea
              className="description-input"
              value={form.jobDescription}
              onChange={(event) => updateField("jobDescription", event.target.value)}
              placeholder="Describe the role, required skills, and what success looks like..."
              maxLength={20_000}
              aria-invalid={Boolean(fieldErrors.jobDescription)}
            />
            <span className="character-count">{form.jobDescription.length.toLocaleString()} / 20,000</span>
          </Field>
          <Field label="Resume content" hint="Plain-text only. The resume is not saved with the analysis." error={fieldErrors.resumeText}>
            <textarea
              className="resume-input"
              value={form.resumeText}
              onChange={(event) => {
                updateField("resumeText", event.target.value);
                setResumeFile(null);
              }}
              placeholder="Paste the candidate’s resume text here..."
              maxLength={MAX_RESUME_LENGTH}
              aria-invalid={Boolean(fieldErrors.resumeText)}
            />
            <span className="character-count">{form.resumeText.length.toLocaleString()} / 30,000</span>
          </Field>
          <label className="file-picker">
            <input type="file" accept=".txt,text/plain" onChange={onFileSelected} />
            <span className="file-icon">↑</span>
            <span>
              <strong>{resumeFile?.name ?? "Upload a .txt file"}</strong>
              <small>{resumeFile ? `${Math.ceil(resumeFile.size / 1024)} KB · Ready to upload` : "Maximum 60 KB"}</small>
            </span>
          </label>

          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <button className="button button-primary submit-button" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Analyzing resume…</> : <>Generate analysis <span aria-hidden="true">→</span></>}
          </button>
          <p className="form-disclaimer">AI-generated results can be incomplete. Review source evidence and use consistent, job-related criteria.</p>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}
