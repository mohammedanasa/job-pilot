import Image from "next/image";

const jobSearchFeatures = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    active: true,
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
    active: false,
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
    active: false,
  },
];

const applicationFeatures = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
    active: false,
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
    active: false,
  },
];

export function ManageSearchSection() {
  return (
    <section className="grid border-b border-border md:grid-cols-2">
      <div className="landing-grid-bg flex min-h-[540px] flex-col justify-center border-b border-border md:border-b-0 md:border-r">
        <div className="px-8 py-12 md:px-14">
          <h2 className="max-w-[380px] text-[34px] font-bold leading-[1.08] text-text-slate md:text-[42px]">
            Manage Your Job Search With Ease
          </h2>
        </div>
        <div className="border-t border-border">
          {jobSearchFeatures.map((item) => (
            <FeatureTextRow key={item.title} {...item} />
          ))}
        </div>
      </div>

      <div className="flex min-h-[540px] items-center justify-center bg-surface-muted px-6 py-12 md:px-10">
        <Image
          src="/images/jobs-lists.png"
          alt="JobPilot job list showing companies, match scores, salary estimates, and sources"
          width={1182}
          height={889}
          className="h-auto w-full max-w-[520px]"
        />
      </div>
    </section>
  );
}

export function ApplyConfidenceSection() {
  return (
    <section className="grid border-b border-border md:grid-cols-2">
      <div className="flex min-h-[540px] items-center justify-center bg-surface-muted px-6 py-12 md:px-10">
        <Image
          src="/images/agnet-log.png"
          alt="JobPilot agent log showing role discovery and application preparation steps"
          width={1072}
          height={828}
          className="h-auto w-full max-w-[480px]"
        />
      </div>

      <div className="landing-grid-bg flex min-h-[540px] flex-col justify-center border-t border-border md:border-l md:border-t-0">
        <div className="px-8 py-12 md:px-14">
          <h2 className="max-w-[430px] text-[34px] font-bold leading-[1.08] text-text-slate md:text-[42px]">
            Apply With More Confidence, Every Time
          </h2>
        </div>
        <div className="border-t border-border">
          {applicationFeatures.map((item) => (
            <FeatureTextRow key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

type FeatureTextRowProps = {
  title: string;
  description: string;
  active: boolean;
};

function FeatureTextRow({ title, description, active }: FeatureTextRowProps) {
  return (
    <article
      className={`border-b border-border px-8 py-7 last:border-b-0 md:px-14 ${
        active ? "border-l-2 border-l-accent" : "border-l-2 border-l-transparent"
      }`}
    >
      <h3 className="text-base font-semibold leading-6 text-text-dark">
        {title}
      </h3>
      <p className="mt-3 max-w-[470px] text-sm font-medium leading-6 text-text-secondary">
        {description}
      </p>
    </article>
  );
}
