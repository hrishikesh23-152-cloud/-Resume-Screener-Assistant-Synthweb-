import MatchScore from "./MatchScore.js";
import type { AnalysisResult } from "../services/api.js";

export default function AnalysisReport({
  analysis,
  jobRole,
}: {
  analysis: AnalysisResult;
  jobRole: string;
}) {
  return (
    <div className="report-stack">
      <section className="result-hero panel">
        <div>
          <p className="eyebrow">ANALYSIS REPORT</p>
          <h2>{jobRole} match results</h2>
          <p className="candidate-identity">
            {analysis.candidateName} <span>·</span> {analysis.candidateEmail}
          </p>
          <p className="muted">Based on the uploaded resume and job description.</p>
        </div>
        <MatchScore score={analysis.matchScore} />
      </section>

      <section className="report-grid">
        <article className="panel list-panel">
          <div className="section-heading">
            <span className="section-icon icon-positive">+</span>
            <div>
              <h3>Matching skills</h3>
              <p>Evidence aligned with the role</p>
            </div>
          </div>
          <ul className="tag-list">
            {analysis.matchingSkills.map((skill) => (
              <li className="skill-tag" key={skill}>{skill}</li>
            ))}
          </ul>
        </article>
        <article className="panel list-panel">
          <div className="section-heading">
            <span className="section-icon icon-gap">−</span>
            <div>
              <h3>Gaps to explore</h3>
              <p>Missing evidence is not proof of missing ability</p>
            </div>
          </div>
          <ul className="gap-list">
            {analysis.skillGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="panel questions-panel">
        <div className="section-heading">
          <span className="section-icon icon-question">?</span>
          <div>
            <h3>Interview questions</h3>
            <p>Use these to verify relevant experience</p>
          </div>
        </div>
        <ol className="question-list">
          {analysis.interviewQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
