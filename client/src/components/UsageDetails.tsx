import type { AnalysisUsage } from "../services/api.js";

interface UsageDetailsProps {
  usage: AnalysisUsage;
}

function display(value: number | string | null): string {
  return value === null ? "Not provided" : String(value);
}

export default function UsageDetails({ usage }: UsageDetailsProps) {
  return (
    <details className="usage-card">
      <summary>
        <span>
          <strong>AI usage details</strong>
          <small>Analysis tokens and organization quota</small>
        </span>
        <span aria-hidden="true">+</span>
      </summary>
      <div className="usage-content">
        <p className="usage-note">
          Tokens used apply to this analysis. Remaining quota is shared by the Groq organization and is
          not an individual HR allowance.
        </p>
        <div className="usage-grid">
          <UsageValue label="Tokens used" value={display(usage.tokensUsed.total)} />
          <UsageValue label="Prompt tokens" value={display(usage.tokensUsed.prompt)} />
          <UsageValue label="Completion tokens" value={display(usage.tokensUsed.completion)} />
          <UsageValue label="Organization token limit" value={display(usage.organizationQuota.tokenLimit)} />
          <UsageValue
            label="Organization tokens remaining"
            value={display(usage.organizationQuota.tokensRemaining)}
          />
          <UsageValue label="Request limit" value={display(usage.organizationQuota.requestLimit)} />
          <UsageValue
            label="Organization requests remaining"
            value={display(usage.organizationQuota.requestsRemaining)}
          />
          <UsageValue
            label="Quota reset"
            value={display(usage.organizationQuota.tokensReset ?? usage.organizationQuota.requestsReset)}
          />
          <UsageValue label="Retries" value={String(usage.retryCount)} />
          <UsageValue
            label="Retry-After wait"
            value={usage.retryAfterMs === null ? "Not applicable" : `${usage.retryAfterMs} ms`}
          />
        </div>
      </div>
    </details>
  );
}

function UsageValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="usage-value">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
