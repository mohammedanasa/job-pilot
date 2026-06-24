import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="overflow-hidden border-b border-border">
      <div className="landing-soft-bg px-6 pb-12 pt-18 text-center md:pb-16 md:pt-18">
        <div className="mx-auto max-w-[760px]">
          <h1 className="text-[40px] font-bold leading-[1.05] text-text-slate md:text-[56px]">
            Job hunting is hard.
            <br />
            Your tools shouldn&apos;t be.
          </h1>
          <p className="mx-auto mt-7 max-w-[620px] text-sm font-medium leading-6 text-text-secondary">
            Stop applying blind. JobPilot finds the jobs, researches the companies,
            and gives you everything you need to stand out.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        </div>
      </div>

      <div className="bg-surface-muted px-6 py-12 md:py-14">
        <div className="mx-auto max-w-[1004px]">
          <Image
            src="/images/dashboard-demo.png"
            alt="JobPilot dashboard preview showing job stats, recent activity, and research charts"
            width={2394}
            height={1208}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
