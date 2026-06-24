"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import posthog from "posthog-js";
import { identifyPostHogUser } from "@/lib/posthog-client";

const oauthCodeVerifierKey = "jobpilot.oauthCodeVerifier";

type AuthUser = {
  id: string;
  email?: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readExchangeUser(value: unknown): AuthUser | null {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) {
    return null;
  }

  const user = value.data.user;
  if (!isRecord(user) || typeof user.id !== "string") {
    return null;
  }

  return {
    id: user.id,
    email: typeof user.email === "string" || user.email === null ? user.email : undefined,
  };
}

function readExchangeError(value: unknown): string {
  if (!isRecord(value) || typeof value.error !== "string") {
    return "OAuth exchange failed";
  }

  return value.error;
}

export function AuthCallback(): ReactElement {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function finishAuth(): Promise<void> {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("insforge_code");
      const providerError = params.get("error");
      const codeVerifier = window.sessionStorage.getItem(oauthCodeVerifierKey);

      if (providerError || !code || !codeVerifier) {
        if (!active) {
          return;
        }

        const errorDetail = providerError ?? "OAuth callback data missing";
        console.error("[auth/callback]", errorDetail);
        posthog.capture("auth_failed", { reason: errorDetail, stage: "callback_params" });
        setErrorMessage("Could not complete sign in. Please try again.");
        return;
      }

      let response: Response;
      let body: unknown;

      try {
        response = await fetch("/api/auth/oauth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, codeVerifier }),
        });
        body = await response.json();
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("[auth/callback]", error);
        posthog.capture("auth_failed", { reason: "fetch_error", stage: "oauth_exchange" });
        setErrorMessage("Could not complete sign in. Please try again.");
        return;
      }

      if (!active) {
        return;
      }

      const user = readExchangeUser(body);

      if (!response.ok || !user) {
        const errorDetail = readExchangeError(body);
        console.error("[auth/callback]", errorDetail);
        posthog.capture("auth_failed", { reason: errorDetail, stage: "oauth_exchange" });
        setErrorMessage("Could not complete sign in. Please try again.");
        return;
      }

      window.sessionStorage.removeItem(oauthCodeVerifierKey);

      identifyPostHogUser(user.id, user.email);
      posthog.capture("user_signed_in", { method: "oauth" });

      router.replace("/dashboard");
      router.refresh();
    }

    void finishAuth();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="text-2xl font-semibold leading-8 text-text-primary">
        {errorMessage ? "Sign in failed" : "Completing sign in"}
      </h1>
      <p className="mt-2 text-sm font-medium leading-6 text-text-secondary">
        {errorMessage ?? "We are connecting your account and opening your dashboard."}
      </p>
      {errorMessage ? (
        <Link
          href="/login"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-overlay-dark px-4 text-sm font-medium leading-5 text-accent-foreground transition-colors hover:bg-overlay"
        >
          Back to login
        </Link>
      ) : null}
    </div>
  );
}
