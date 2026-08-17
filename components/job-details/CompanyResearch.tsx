"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  HelpCircle,
  Info,
  Layers,
  Link2,
  Loader2,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
  TriangleAlert,
  Users,
} from "lucide-react";
import type { CompanyDossier } from "@/agent/types";

type Props = {
  jobId: string;
  company: string;
  research: CompanyDossier | null;
};

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactElement;
  title: string;
  children: ReactElement;
}): ReactElement {
  return (
    <div className="border-t border-border px-6 py-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-muted text-accent">
          {icon}
        </span>
        <h3 className="text-sm font-semibold leading-5 text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }): ReactElement {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2 text-sm font-medium leading-6 text-text-primary"
        >
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function TagList({ items }: { items: string[] }): ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-full bg-surface-secondary px-3 py-1 text-sm font-medium leading-5 text-text-secondary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function CompanyResearch({ jobId, company, research }: Props): ReactElement {
  const router = useRouter();
  const [dossier, setDossier] = useState<CompanyDossier | null>(research);
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResearch(): Promise<void> {
    if (isResearching) return;

    setIsResearching(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const body: { success: boolean; data?: { research: CompanyDossier }; error?: string } =
        await response.json();

      if (!body.success || !body.data) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }

      setDossier(body.data.research);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsResearching(false);
    }
  }

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
          onClick={handleResearch}
          disabled={isResearching}
          className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium leading-5 text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isResearching ? "Researching..." : dossier ? "Re-run Research" : "Research Company"}
        </button>
      </div>

      {error && (
        <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-error px-4 py-3">
          <TriangleAlert size={16} className="text-error-foreground" />
          <p className="text-sm font-medium leading-5 text-error-foreground">{error}</p>
        </div>
      )}

      {!dossier && !isResearching && (
        <div className="flex flex-col items-center gap-2 border-t border-border px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-secondary text-text-secondary">
            <Building2 size={20} />
          </span>
          <p className="text-sm font-semibold leading-5 text-text-primary">No research yet</p>
          <p className="max-w-sm text-sm font-medium leading-5 text-text-muted">
            Click &quot;Research Company&quot; to let the AI look up {company}&apos;s public pages and build
            a dossier.
          </p>
        </div>
      )}

      {dossier && (
        <>
          {!dossier.grounded && (
            <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl bg-info-lightest px-4 py-3">
              <Info size={16} className="text-info-foreground" />
              <p className="text-sm font-medium leading-5 text-info-foreground">
                Based on the job posting only — we couldn&apos;t reach {company}&apos;s website.
              </p>
            </div>
          )}

          <Section icon={<Building2 size={14} />} title="Company Overview">
            <p className="text-sm font-medium leading-6 text-text-primary">
              {dossier.companyOverview}
            </p>
          </Section>

          {dossier.techStack.length > 0 && (
            <Section icon={<Layers size={14} />} title="Tech Stack">
              <TagList items={dossier.techStack} />
            </Section>
          )}

          {dossier.culture.length > 0 && (
            <Section icon={<Users size={14} />} title="Culture">
              <BulletList items={dossier.culture} />
            </Section>
          )}

          <Section icon={<Target size={14} />} title="Why This Role">
            <p className="text-sm font-medium leading-6 text-text-primary">{dossier.whyThisRole}</p>
          </Section>

          {dossier.yourEdge.length > 0 && (
            <Section icon={<Sparkles size={14} />} title="Your Edge">
              <div className="rounded-xl bg-success-lightest p-4">
                <BulletList items={dossier.yourEdge} />
              </div>
            </Section>
          )}

          {dossier.gapsToAddress.length > 0 && (
            <Section icon={<TriangleAlert size={14} />} title="Gaps to Address">
              <BulletList items={dossier.gapsToAddress} />
            </Section>
          )}

          {dossier.smartQuestions.length > 0 && (
            <Section icon={<HelpCircle size={14} />} title="Smart Questions">
              <BulletList items={dossier.smartQuestions} />
            </Section>
          )}

          {dossier.interviewPrep.length > 0 && (
            <Section icon={<MessageSquareText size={14} />} title="Interview Prep">
              <BulletList items={dossier.interviewPrep} />
            </Section>
          )}

          {dossier.sources.length > 0 && (
            <div className="border-t border-border px-6 py-4">
              <div className="mb-2 flex items-center gap-2">
                <Link2 size={12} className="text-text-muted" />
                <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Sources
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {dossier.sources.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-xs font-medium text-accent hover:underline"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
