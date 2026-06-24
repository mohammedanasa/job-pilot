"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge-client";
import posthog from "posthog-js";
import type { ReactElement } from "react";

type AuthProvider = "google" | "github";

const providerLabels: Record<AuthProvider, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub",
};

const oauthCodeVerifierKey = "jobpilot.oauthCodeVerifier";

function GoogleMark(): ReactElement {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs font-semibold text-text-primary">
      G
    </span>
  );
}

function GithubMark(): ReactElement {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface text-xs font-semibold text-overlay-dark">
      GH
    </span>
  );
}

export function LoginForm(): ReactElement {
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleOAuth(provider: AuthProvider): Promise<void> {
    setPendingProvider(provider);
    setErrorMessage(null);

    posthog.capture("oauth_initiated", { provider });

    try {
      const redirectTo = `${window.location.origin}/callback`;
      const { data, error } = await insforge.auth.signInWithOAuth(provider, {
        redirectTo,
        additionalParams: provider === "google" ? { prompt: "select_account" } : undefined,
        skipBrowserRedirect: true,
      });

      if (error || !data.url || !data.codeVerifier) {
        const authError = error ?? new Error("OAuth URL or PKCE verifier missing");
        console.error("[auth/login]", authError);
        setErrorMessage("Could not start sign in. Please try again.");
        setPendingProvider(null);
        return;
      }

      window.sessionStorage.setItem(oauthCodeVerifierKey, data.codeVerifier);
      window.location.assign(data.url);
    } catch (error) {
      console.error("[auth/login]", error);
      setErrorMessage("Could not start sign in. Please try again.");
      setPendingProvider(null);
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold leading-8 text-text-primary">Sign in to JobPilot</h1>
        <p className="text-sm font-medium leading-6 text-text-secondary">
          Use your Google or GitHub account to continue.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => void handleOAuth("google")}
          disabled={pendingProvider !== null}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted"
        >
          <GoogleMark />
          {pendingProvider === "google" ? "Connecting..." : providerLabels.google}
        </button>

        <button
          type="button"
          onClick={() => void handleOAuth("github")}
          disabled={pendingProvider !== null}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-md bg-overlay-dark px-4 text-sm font-medium leading-5 text-accent-foreground transition-colors hover:bg-overlay disabled:cursor-not-allowed disabled:bg-border-muted"
        >
          <GithubMark />
          {pendingProvider === "github" ? "Connecting..." : providerLabels.github}
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-error bg-surface px-3 py-2 text-sm font-medium leading-5 text-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
