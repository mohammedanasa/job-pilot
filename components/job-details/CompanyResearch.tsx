import type { ReactElement } from "react";
import { Building2, Search } from "lucide-react";

type Props = {
  company: string;
};

export function CompanyResearch({ company }: Props): ReactElement {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted text-accent">
            <Building2 size={14} />
          </span>
          <h2 className="text-base font-semibold leading-6 text-text-primary">Company Research</h2>
        </div>

        <button
          type="button"
          disabled
          className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium leading-5 text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search size={16} />
          Research Company
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-border px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary text-text-secondary">
          <Building2 size={20} />
        </span>
        <p className="text-sm font-semibold leading-5 text-text-primary">No research yet</p>
        <p className="max-w-sm text-sm font-medium leading-5 text-text-muted">
          Click &quot;Research Company&quot; to let the AI browse {company}&apos;s public pages and build a
          dossier.
        </p>
      </div>
    </div>
  );
}
