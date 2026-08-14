"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Search, UserRound } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/find-jobs", label: "Find Jobs", icon: Search },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function AppNavbar() {
  const pathname = usePathname();

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

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 pb-4 text-sm font-medium leading-5 transition-colors ${
                  isActive ? "text-accent" : "text-text-dark hover:text-accent"
                }`}
              >
                <Icon size={16} />
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
