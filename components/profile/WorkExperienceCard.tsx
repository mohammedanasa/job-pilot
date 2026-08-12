type WorkExperience = {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  keyResponsibilities: string;
};

type Props = {
  entry: WorkExperience;
  index: number;
  canRemove: boolean;
  onChange: (updated: WorkExperience) => void;
  onRemove: () => void;
};

export function WorkExperienceCard({ entry, index, canRemove, onChange, onRemove }: Props) {
  function update(field: keyof WorkExperience, value: string | boolean) {
    onChange({ ...entry, [field]: value });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-secondary p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          Role {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-text-secondary hover:text-error"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Company Name
          </label>
          <input
            type="text"
            value={entry.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            placeholder="Vercel"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Job Title
          </label>
          <input
            type="text"
            value={entry.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            placeholder="Frontend Engineer"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Start Date
          </label>
          <input
            type="month"
            value={entry.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            End Date
          </label>
          <div className="flex flex-col gap-2">
            <input
              type="month"
              value={entry.endDate}
              disabled={entry.currentlyWorking}
              onChange={(e) => update("endDate", e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
            />
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <input
                type="checkbox"
                checked={entry.currentlyWorking}
                onChange={(e) => update("currentlyWorking", e.target.checked)}
                className="accent-accent"
              />
              Currently working here
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          Key Responsibilities
        </label>
        <textarea
          value={entry.keyResponsibilities}
          onChange={(e) => update("keyResponsibilities", e.target.value)}
          placeholder="Built Next.js features and optimised web vitals. Led a team of 3 developers."
          rows={3}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
        />
      </div>
    </div>
  );
}

export type { WorkExperience };
