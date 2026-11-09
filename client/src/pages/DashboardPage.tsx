import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import AnalysisReport from "../components/AnalysisReport.js";
import { analysisFormSchema } from "../schemas/analysisForm.js";
import { analyzeResume, getErrorMessage, type AnalysisResult } from "../services/api.js";

const emptyForm = {
  jobRole: "",
  jobDescription: "",
};

export default function DashboardPage() {
  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setAnalysis(null);
    const parsed = analysisFormSchema.safeParse({ ...form, resumeFile });
    if (!parsed.success) {
      setFieldErrors(
        Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])),
      );
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      const result = await analyzeResume(parsed.data);
      setAnalysis(result);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;
    setResumeFile(null);
    setFieldErrors((current) => ({ ...current, resumeFile: "" }));
    setError("");
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose a PDF file.");
      input.value = "";
      return;
    }
    if (file.size > 300 * 1024) {
      setError("The PDF must be 300 KB or smaller.");
      input.value = "";
      return;
    }

    try {
      const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
      if (new TextDecoder().decode(header) !== "%PDF-") {
        setError("This file does not appear to be a valid PDF.");
        input.value = "";
        return;
      }
      setResumeFile(file);
    } catch {
      setError("Could not read the PDF file.");
      input.value = "";
    }
  }

  return (
    <>
      <div className="dashboard-grid">
        <section className="intro-column">
          <p className="eyebrow">RESUME ANALYSIS</p>
          <h1>Turn a resume<br /><span>into clear insights.</span></h1>
          <p className="intro-copy">
            Upload a PDF and compare its experience with the role. The AI returns a small,
            structured report for you to review.
          </p>
          <div className="steps-card">
            <p className="eyebrow">HOW IT WORKS</p>
            <ol className="steps-list">
              <li><span>01</span><div><strong>Add the job details</strong><small>Tell us the role and requirements</small></div></li>
              <li><span>02</span><div><strong>Upload a PDF resume</strong><small>Text is extracted for this request only</small></div></li>
              <li><span>03</span><div><strong>Review structured results</strong><small>Use the output as a starting point</small></div></li>
            </ol>
          </div>
          <p className="privacy-note"><span>●</span> Resume files are not saved.</p>
        </section>

        <section className="form-panel panel">
          <div className="form-heading">
            <div>
              <p className="eyebrow">NEW EVALUATION</p>
              <h2>Analyze a resume</h2>
            </div>
            <span className="private-badge">PDF only · 300 KB max</span>
          </div>
          <form onSubmit={onSubmit} noValidate>
            <Field label="Job role" error={fieldErrors.jobRole}>
              <input
                value={form.jobRole}
                onChange={(event) => setForm((current) => ({ ...current, jobRole: event.target.value }))}
                placeholder="e.g. Backend Engineer"
                aria-invalid={Boolean(fieldErrors.jobRole)}
              />
            </Field>
            <Field label="Job description" hint="Include the responsibilities and qualifications to compare." error={fieldErrors.jobDescription}>
              <textarea
                className="description-input"
                value={form.jobDescription}
                onChange={(event) => setForm((current) => ({ ...current, jobDescription: event.target.value }))}
                placeholder="Describe the role, required skills, and what success looks like..."
                maxLength={20_000}
                aria-invalid={Boolean(fieldErrors.jobDescription)}
              />
              <span className="character-count">{form.jobDescription.length.toLocaleString()} / 20,000</span>
            </Field>
            <label className="file-picker">
              <input type="file" accept=".pdf,application/pdf" onChange={onFileSelected} />
              <span className="file-icon">↑</span>
              <span>
                <strong>{resumeFile?.name ?? "Choose a PDF resume"}</strong>
                <small>{resumeFile ? `${Math.ceil(resumeFile.size / 1024)} KB · Ready` : "Selectable text · Up to 20 pages"}</small>
              </span>
            </label>
            {fieldErrors.resumeFile && <span className="field-error">{fieldErrors.resumeFile}</span>}
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button className="button button-primary submit-button" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Extracting and analyzing…</> : <>Analyze PDF <span aria-hidden="true">→</span></>}
            </button>
            <p className="form-disclaimer">AI-generated results can be incomplete. Review source evidence yourself.</p>
          </form>
        </section>
      </div>

      {analysis && (
        <section className="analysis-result">
          <AnalysisReport analysis={analysis} jobRole={form.jobRole} />
        </section>
      )}
    </>
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
  children: ReactNode;
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
