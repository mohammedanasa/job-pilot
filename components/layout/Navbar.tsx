import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="h-16 border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1268px] items-center justify-between px-6">
        <Link href="/" aria-label="JobPilot home">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={124}
            height={42}
            priority
            className="h-auto w-[106px]"
          />
        </Link>

        <Link
          href="/login"
          className="rounded-md bg-overlay-dark px-4 py-2 text-sm font-medium leading-5 text-accent-foreground transition-colors hover:bg-overlay"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}
