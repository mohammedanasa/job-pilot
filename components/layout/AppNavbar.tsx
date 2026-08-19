"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { ChevronDown, LayoutGrid, LogOut, Search, UserRound } from "lucide-react";
import { insforge } from "@/lib/insforge-client";
import { resetPostHogUser } from "@/lib/posthog-client";

const oauthCodeVerifierKey = "jobpilot.oauthCodeVerifier";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/find-jobs", label: "Find Jobs", icon: Search },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  async function handleLogout(): Promise<void> {
    setIsSigningOut(true);

    try {
      const { error } = await insforge.auth.signOut();

      if (error) {
        console.error("[navbar/logout]", error);
        setIsSigningOut(false);
        return;
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("[navbar/logout]", `Cookie clear failed with ${response.status}`);
        setIsSigningOut(false);
        return;
      }

      window.sessionStorage.removeItem(oauthCodeVerifierKey);
      posthog.capture("user_signed_out");
      resetPostHogUser();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("[navbar/logout]", error);
      setIsSigningOut(false);
    }
  }

  return (
    <header className="h-16 border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1268px] items-center justify-between px-6">
        <Link href="/dashboard" aria-label="JobPilot home">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={124}
            height={42}
            priority
            className="h-auto w-[106px]"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.href === "/profile") {
              return (
                <div key={item.href} ref={menuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((open) => !open)}
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    className={`flex items-center gap-1.5 text-sm font-medium leading-5 transition-colors ${
                      isActive ? "text-accent" : "text-text-dark hover:text-accent"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-10 w-44 rounded-md border border-border bg-surface py-1 shadow-md"
                    >
                      <Link
                        href="/profile"
                        role="menuitem"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium leading-5 text-text-primary hover:bg-surface-secondary"
                      >
                        <UserRound size={16} />
                        Profile
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={isSigningOut}
                        onClick={() => void handleLogout()}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium leading-5 text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:text-text-muted"
                      >
                        <LogOut size={16} />
                        {isSigningOut ? "Signing out..." : "Log out"}
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 text-sm font-medium leading-5 transition-colors ${
                  isActive ? "text-accent" : "text-text-dark hover:text-accent"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
