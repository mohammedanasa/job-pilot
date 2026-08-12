type Props = {
  percentage: number;
  missingFields: string[];
};

export function CompletionBanner({ percentage, missingFields }: Props) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isComplete = percentage === 100;
  const ringColor = isComplete ? "var(--color-success)" : "var(--color-error)";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="var(--color-success)" strokeWidth="1.5" />
              <path
                d="M5 8L7 10L11 6"
                stroke="var(--color-success)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="var(--color-error)" strokeWidth="1.5" />
              <path d="M8 4.5V8.5" stroke="var(--color-error)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11" r="0.75" fill="var(--color-error)" />
            </svg>
          )}
          <span className="text-sm font-semibold leading-5 text-text-primary">
            {isComplete ? "Profile complete" : "Profile needs attention"}
          </span>
        </div>

        {isComplete ? (
          <p className="text-sm font-medium leading-5 text-text-secondary">
            Your profile is fully set up. JobPilot can now match and tailor roles to your experience.
          </p>
        ) : (
          <>
            <p className="text-sm font-medium leading-5 text-text-secondary">
              Complete the missing fields to improve your chance of getting tailored matches and
              generating quality resumes.
            </p>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full border border-border px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-text-secondary"
                >
                  {field}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="ml-8 flex-shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: "18px",
              fontWeight: 700,
              fill: ringColor,
            }}
          >
            {percentage}%
          </text>
        </svg>
      </div>
    </div>
  );
}
