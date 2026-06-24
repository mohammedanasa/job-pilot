import Link from "next/link";

export function BottomCta() {
  return (
    <section className="landing-soft-bg border-b border-border px-6 py-24 text-center md:py-28">
      <h2 className="mx-auto max-w-[760px] text-[38px] font-bold leading-[1.08] text-text-slate md:text-[52px]">
        Your next job search can feel a lot less overwhelming
      </h2>
      <p className="mx-auto mt-8 max-w-[560px] text-sm font-medium leading-6 text-text-secondary">
        Set up your profile, upload your resume, and start finding matches in minutes.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-md bg-overlay-dark px-5 py-2.5 text-sm font-medium leading-5 text-accent-foreground transition-colors hover:bg-overlay"
        >
          Get Started <span aria-hidden="true">›</span>
        </Link>
        <Link
          href="/find-jobs"
          className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary"
        >
          Find Your First Match
        </Link>
      </div>
    </section>
  );
}
