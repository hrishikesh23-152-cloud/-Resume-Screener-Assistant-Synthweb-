import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AnalysisReport from "../components/AnalysisReport.js";
import UsageDetails from "../components/UsageDetails.js";
import { getAnalysis, getErrorMessage, type Analysis, type AnalysisUsage } from "../services/api.js";

export default function AnalysisDetailsPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const usage = (location.state as { usage?: AnalysisUsage } | null)?.usage;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAnalysis(id)
      .then((record) => {
        if (active) setAnalysis(record);
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
  }, [id]);

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <Link className="back-link" to="/history">← Back to history</Link>
          <h1>Analysis details</h1>
        </div>
        <Link className="button button-secondary" to="/">New analysis</Link>
      </div>
      {loading && <div className="panel state-panel"><span className="spinner" /> Loading analysis…</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {!loading && analysis && (
        <>
          <AnalysisReport analysis={analysis} />
          {usage && <UsageDetails usage={usage} />}
        </>
      )}
    </div>
  );
}
