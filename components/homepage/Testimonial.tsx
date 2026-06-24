import Image from "next/image";

export function Testimonial() {
  return (
    <section className="landing-grid-bg border-b border-border px-6 py-28 text-center">
      <p className="text-xs font-semibold uppercase leading-4 tracking-[0.08em] text-accent">
        Success Stories
      </p>
      <blockquote className="mx-auto mt-8 max-w-[760px] text-[28px] font-semibold leading-[1.35] text-text-slate-medium md:text-[34px]">
        &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
        dashboard to see interviews waiting. It feels like cheating. Had 3 offers
        on the table simultaneously.&rdquo;
      </blockquote>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Image
          src="/images/user-icon.png"
          alt="Tom Wilson"
          width={48}
          height={48}
          className="rounded-sm"
        />
        <div className="text-left">
          <p className="text-sm font-semibold leading-5 text-text-primary">Tom Wilson</p>
          <p className="text-xs font-normal leading-4 text-text-muted">Junior Developer</p>
        </div>
      </div>
    </section>
  );
}
