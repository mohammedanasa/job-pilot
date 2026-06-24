import posthog from "posthog-js";

let isPostHogInitialized = false;

export function initPostHog(): void {
  if (isPostHogInitialized || typeof window === "undefined") {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest";

  if (!posthogKey) {
    return;
  }

  posthog.init(posthogKey, {
    api_host: "/ingest",
    ui_host: posthogHost,
    defaults: "2026-01-30",
    capture_pageview: false,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });

  isPostHogInitialized = true;
}

export function identifyPostHogUser(userId: string, email?: string | null): void {
  initPostHog();
  posthog.identify(userId, {
    email: email ?? undefined,
  });
}

export function resetPostHogUser(): void {
  if (!isPostHogInitialized) {
    return;
  }

  posthog.reset();
}
