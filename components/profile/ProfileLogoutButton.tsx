"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { insforge } from "@/lib/insforge-client";
import { resetPostHogUser } from "@/lib/posthog-client";
import type { ReactElement } from "react";

const oauthCodeVerifierKey = "jobpilot.oauthCodeVerifier";

export function ProfileLogoutButton(): ReactElement {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout(): Promise<void> {
    setIsSigningOut(true);
    setErrorMessage(null);

    try {
      const { error } = await insforge.auth.signOut();

      if (error) {
        console.error("[profile/logout]", error);
        setErrorMessage("Could not sign out. Please try again.");
        setIsSigningOut(false);
        return;
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("[profile/logout]", `Cookie clear failed with ${response.status}`);
        setErrorMessage("Could not sign out. Please try again.");
        setIsSigningOut(false);
        return;
      }

      window.sessionStorage.removeItem(oauthCodeVerifierKey);
      posthog.capture("user_signed_out");
      resetPostHogUser();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("[profile/logout]", error);
      setErrorMessage("Could not sign out. Please try again.");
      setIsSigningOut(false);
    }
  }

  return (
    <div className="mt-6 border-t border-border pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold leading-6 text-text-primary">Account session</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-text-secondary">
            Sign out of JobPilot on this browser.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isSigningOut}
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium leading-5 text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted"
        >
          {isSigningOut ? "Signing out..." : "Log out"}
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
