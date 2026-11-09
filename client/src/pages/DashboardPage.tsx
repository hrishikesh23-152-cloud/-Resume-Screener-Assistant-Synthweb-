import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import AnalysisReport from "../components/AnalysisReport.js";
import { analysisFormSchema } from "../schemas/analysisForm.js";
import {
  analyzeResume,
  getAnalysisHistory,
  getErrorMessage,
  type AnalysisResult,
  type AnalysisUsage,
} from "../services/api.js";

const emptyForm = {
  candidateName: "",
  candidateEmail: "",
  jobRole: "",
  jobDescription: "",
};

const emptyFilters = { candidateName: "", candidateEmail: "", jobRole: "", minScore: "", maxScore: "", from: "", to: "" };

export default function DashboardPage() {
  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<AnalysisUsage | null>(null);
  const [filters, setFilters] = useState(emptyFilters);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyError, setHistoryError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    void loadHistory(1);
  }, []);

  async function loadHistory(page: number, search = filters) {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const result = await getAnalysisHistory({
        candidateName: search.candidateName.trim() || undefined,
        candidateEmail: search.candidateEmail.trim() || undefined,
        jobRole: search.jobRole.trim() || undefined,
        minScore: search.minScore || undefined,
        maxScore: search.maxScore || undefined,
        from: search.from || undefined,
        to: search.to || undefined,
        page,
      });
      setHistory(result.items);
      setHistoryPage(result.page);
      setHistoryPages(result.pages);
      setHistoryTotal(result.total);
    } catch (requestError) {
      setHistoryError(getErrorMessage(requestError));
    } finally {
      setHistoryLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setAnalysis(null);
    setUsage(null);
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
      setAnalysis(result.analysis);
      setUsage(result.usage);
      void loadHistory(1);
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
            <Field label="Candidate name" error={fieldErrors.candidateName}>
              <input
                value={form.candidateName}
                onChange={(event) => setForm((current) => ({ ...current, candidateName: event.target.value }))}
                placeholder="e.g. Alex Morgan"
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.candidateName)}
              />
            </Field>
            <Field label="Candidate email" error={fieldErrors.candidateEmail}>
              <input
                type="email"
                value={form.candidateEmail}
                onChange={(event) => setForm((current) => ({ ...current, candidateEmail: event.target.value }))}
                placeholder="alex@example.com"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.candidateEmail)}
              />
            </Field>
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
          <AnalysisReport analysis={analysis} jobRole={analysis.jobRole} />
          {usage && <UsageSummary usage={usage} />}
        </section>
      )}

      <section className="history-section panel">
        <div className="form-heading">
          <div>
            <p className="eyebrow">SAVED ANALYSES</p>
            <h2>Find candidate results</h2>
          </div>
          <span className="muted">{historyTotal} total</span>
        </div>
        <form
          className="history-filters"
          onSubmit={(event) => {
            event.preventDefault();
            void loadHistory(1, filters);
          }}
        >
          <input aria-label="Filter by candidate name" placeholder="Candidate name" value={filters.candidateName} onChange={(event) => setFilters({ ...filters, candidateName: event.target.value })} />
          <input aria-label="Filter by candidate email" placeholder="Candidate email" type="email" value={filters.candidateEmail} onChange={(event) => setFilters({ ...filters, candidateEmail: event.target.value })} />
          <input aria-label="Filter by role" placeholder="Job role" value={filters.jobRole} onChange={(event) => setFilters({ ...filters, jobRole: event.target.value })} />
          <input aria-label="Minimum score" placeholder="Min score" type="number" min="0" max="100" value={filters.minScore} onChange={(event) => setFilters({ ...filters, minScore: event.target.value })} />
          <input aria-label="Maximum score" placeholder="Max score" type="number" min="0" max="100" value={filters.maxScore} onChange={(event) => setFilters({ ...filters, maxScore: event.target.value })} />
          <input aria-label="Created from" title="Created from" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
          <input aria-label="Created to" title="Created to" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
          <button className="button button-primary" type="submit" disabled={historyLoading}>Search</button>
        </form>
        {historyError && <div className="alert alert-error" role="alert">{historyError}</div>}
        {historyLoading ? (
          <p className="muted">Loading saved analyses…</p>
        ) : history.length ? (
          <>
            <div className="saved-analysis-list">
              {history.map((item) => (
                <button
                  className="saved-analysis-row"
                  key={item._id}
                  type="button"
                  onClick={() => {
                    setAnalysis(item);
                    setUsage(null);
                  }}
                >
                  <span><strong>{item.candidateName}</strong><small>{item.candidateEmail}</small></span>
                  <span><strong>{item.jobRole}</strong><small>{new Date(item.createdAt).toLocaleDateString()}</small></span>
                  <span className="saved-score">{item.matchScore}%</span>
                </button>
              ))}
            </div>
            <div className="pagination">
              <button className="button button-secondary" type="button" disabled={historyPage <= 1} onClick={() => void loadHistory(historyPage - 1)}>Previous</button>
              <span>Page {historyPage} of {Math.max(1, historyPages)}</span>
              <button className="button button-secondary" type="button" disabled={historyPage >= historyPages} onClick={() => void loadHistory(historyPage + 1)}>Next</button>
            </div>
          </>
        ) : (
          <p className="muted">No saved analyses match these filters.</p>
        )}
      </section>
    </>
  );
}

function UsageSummary({ usage }: { usage: AnalysisUsage }) {
  return (
    <details className="usage-card" open>
      <summary><span><strong>AI usage details</strong><small>Token use for this analysis and shared Groq organization quota</small></span><span>⌄</span></summary>
      <div className="usage-content">
        <p className="usage-note">Tokens consumed for this analysis are separate from the shared provider quota.</p>
        <div className="usage-grid">
          <UsageValue label="Tokens used" value={usage.tokensUsed.total} />
          <UsageValue label="Tokens remaining (organization)" value={usage.organizationQuota.tokensRemaining} />
          <UsageValue label="Request limit" value={usage.organizationQuota.requestLimit} />
          <UsageValue label="Requests remaining" value={usage.organizationQuota.requestsRemaining} />
          <UsageValue label="Request reset" value={usage.organizationQuota.requestsReset} />
          <UsageValue label="Token reset" value={usage.organizationQuota.tokensReset} />
          <UsageValue label="Provider retry-after (seconds)" value={usage.retryAfterMs === null ? null : Math.ceil(usage.retryAfterMs / 1000)} />
        </div>
        <p className="usage-note">{usage.retryStatus}</p>
      </div>
    </details>
  );
}

function UsageValue({ label, value }: { label: string; value: string | number | null }) {
  return <div className="usage-value"><span>{label}</span><strong>{value ?? "Not provided"}</strong></div>;
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
