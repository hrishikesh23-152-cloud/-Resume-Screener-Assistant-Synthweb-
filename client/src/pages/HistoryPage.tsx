import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import MatchScore from "../components/MatchScore.js";
import {
  getAnalysisHistory,
  getErrorMessage,
  type AnalysisFilters,
  type AnalysisHistory,
} from "../services/api.js";

const initialFilters: AnalysisFilters = { page: 1, limit: 10 };

export default function HistoryPage() {
  const [form, setForm] = useState({ candidateName: "", candidateEmail: "", jobRole: "", minScore: "", maxScore: "", from: "", to: "" });
  const [filters, setFilters] = useState(initialFilters);
  const [history, setHistory] = useState<AnalysisHistory | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getAnalysisHistory(filters)
      .then((data) => {
        if (active) setHistory(data);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({
      candidateName: form.candidateName.trim() || undefined,
      candidateEmail: form.candidateEmail.trim() || undefined,
      jobRole: form.jobRole.trim() || undefined,
      minScore: form.minScore || undefined,
      maxScore: form.maxScore || undefined,
      from: form.from || undefined,
      to: form.to || undefined,
      page: 1,
      limit: 10,
    });
  }

  function clearFilters() {
    setForm({ candidateName: "", candidateEmail: "", jobRole: "", minScore: "", maxScore: "", from: "", to: "" });
    setFilters(initialFilters);
  }

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Analysis history</h1>
          <p className="muted">Search previous evaluations and revisit their evidence.</p>
        </div>
        <Link className="button button-primary" to="/">+ New analysis</Link>
      </div>

      <form className="filter-panel panel" onSubmit={applyFilters}>
        <div className="filters-grid">
          <FilterField label="Candidate name">
            <input value={form.candidateName} onChange={(event) => setForm({ ...form, candidateName: event.target.value })} placeholder="Search name" />
          </FilterField>
          <FilterField label="Candidate email">
            <input type="email" value={form.candidateEmail} onChange={(event) => setForm({ ...form, candidateEmail: event.target.value })} placeholder="Search email" />
          </FilterField>
          <FilterField label="Job role">
            <input value={form.jobRole} onChange={(event) => setForm({ ...form, jobRole: event.target.value })} placeholder="Filter role" />
          </FilterField>
          <FilterField label="Minimum score">
            <input type="number" min="0" max="100" value={form.minScore} onChange={(event) => setForm({ ...form, minScore: event.target.value })} placeholder="0" />
          </FilterField>
          <FilterField label="Maximum score">
            <input type="number" min="0" max="100" value={form.maxScore} onChange={(event) => setForm({ ...form, maxScore: event.target.value })} placeholder="100" />
          </FilterField>
          <FilterField label="Created from">
            <input type="date" value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })} />
          </FilterField>
          <FilterField label="Created to">
            <input type="date" value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })} />
          </FilterField>
        </div>
        <div className="filter-actions">
          <button className="button button-primary" type="submit">Apply filters</button>
          <button className="button button-quiet" type="button" onClick={clearFilters}>Clear</button>
        </div>
      </form>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {loading && <div className="panel state-panel"><span className="spinner" /> Loading history…</div>}
      {!loading && history?.items.length === 0 && (
        <div className="panel empty-state">
          <span className="empty-mark">◎</span>
          <h2>No analyses found</h2>
          <p>Try changing your filters or create a new analysis to get started.</p>
          <Link className="button button-primary" to="/">Create analysis</Link>
        </div>
      )}
      {!loading && Boolean(history?.items.length) && (
        <>
          <div className="history-summary"><strong>{history?.total} {history?.total === 1 ? "analysis" : "analyses"}</strong><span>Newest first</span></div>
          <div className="history-list">
            {history?.items.map((item) => (
              <Link className="history-card panel" key={item.id} to={`/analysis/${item.id}`}>
                <div className="history-initial">{item.candidateName.slice(0, 1).toUpperCase()}</div>
                <div className="history-main">
                  <strong>{item.candidateName}</strong>
                  <span>{item.candidateEmail}</span>
                  <small>{item.jobRole}</small>
                </div>
                <div className="history-date">{new Date(item.createdAt).toLocaleDateString()}</div>
                <MatchScore score={item.matchScore} compact />
                <span className="history-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
          {history && history.pages > 1 && (
            <div className="pagination">
              <button
                className="button button-secondary"
                disabled={history.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                ← Previous
              </button>
              <span>Page {history.page} of {history.pages}</span>
              <button
                className="button button-secondary"
                disabled={history.page >= history.pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="filter-field"><span>{label}</span>{children}</label>;
}
