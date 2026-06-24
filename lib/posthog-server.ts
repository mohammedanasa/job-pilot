import { PostHog } from "posthog-node";

type PostHogEventName =
  | "job_search_started"
  | "job_found"
  | "profile_completed"
  | "company_researched"
  | "server_auth_completed";

type PostHogEventProperties = Record<string, string | number | boolean | null | undefined>;

type CapturePostHogEventParams = {
  distinctId: string;
  event: PostHogEventName;
  properties: PostHogEventProperties;
};

function createPostHogServer(): PostHog | null {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!posthogKey) {
    return null;
  }

  return new PostHog(posthogKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function capturePostHogEvent({
  distinctId,
  event,
  properties,
}: CapturePostHogEventParams): Promise<void> {
  const posthog = createPostHogServer();

  if (!posthog) {
    return;
  }

  try {
    posthog.capture({
      distinctId,
      event,
      properties,
    });
  } catch (error) {
    console.error("[posthog/capture]", error);
  }

  try {
    await posthog.shutdown();
  } catch (error) {
    console.error("[posthog/shutdown]", error);
  }
}
