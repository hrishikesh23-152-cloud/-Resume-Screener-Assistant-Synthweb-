interface MatchScoreProps {
  score: number;
  compact?: boolean;
}

export default function MatchScore({ score, compact = false }: MatchScoreProps) {
  return (
    <div className={compact ? "score score-compact" : "score"}>
      <div
        className="score-ring"
        style={{ "--score": `${score}%` } as React.CSSProperties}
        aria-label={`Match score ${score} out of 100`}
      >
        <span>{score}</span>
        <small>/ 100</small>
      </div>
      <div className="score-copy">
        <strong>Match score</strong>
        <span>Evidence-based alignment</span>
      </div>
    </div>
  );
}
