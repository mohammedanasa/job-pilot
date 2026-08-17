import Link from "next/link";

export function IncompleteProfileBanner() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold leading-5 text-text-primary">
          Your profile isn&apos;t complete yet
        </span>
        <span className="text-sm font-medium leading-5 text-text-secondary">
          Finish your profile so JobPilot can find and score jobs that fit you.
        </span>
      </div>
      <Link
        href="/profile"
        className="flex-shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium leading-5 text-accent-foreground"
      >
        Complete Profile
      </Link>
    </div>
  );
}
