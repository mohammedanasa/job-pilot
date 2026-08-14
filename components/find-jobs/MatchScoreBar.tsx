type Props = {
  score: number;
};

function scoreColorClass(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 80) return "bg-info";
  return "bg-warning";
}

export function MatchScoreBar({ score }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-24 rounded-full bg-border-light">
        <div
          className={`h-1 rounded-full ${scoreColorClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium leading-5 text-text-primary">{score}%</span>
    </div>
  );
}
