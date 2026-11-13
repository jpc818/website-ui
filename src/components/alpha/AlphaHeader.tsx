import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BriefingRequest } from "@/components/alpha/BriefingRequest";
import { MobileMenu } from "@/components/alpha/MobileMenu";
import { NavLinks } from "@/components/alpha/NavLinks";
import { betaPath, betaLabel } from "@/app/site";

const links = [
  { href: "/research", label: "Research" },
  { href: "/#how", label: "How it works" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/about", label: "About" },
];

export function AlphaHeader() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="fixed top-0 z-50 w-full border-b border-white/8 bg-background/95 md:bg-background/80 md:backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
          <Link href="/" className="text-xl" aria-label="jargAI home">
            <Logo />
          </Link>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-5 text-[15px] font-medium text-muted lg:flex"
          >
            <NavLinks links={links} />
          </nav>
          <div className="flex items-center gap-3 lg:gap-5">
            <Link
              href={betaPath}
              className="hidden whitespace-nowrap text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline lg:inline"
            >
              {betaLabel}
            </Link>
            <BriefingRequest className="cursor-pointer whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:px-5">
              Request <span className="hidden sm:inline">the research </span>briefing
            </BriefingRequest>
            <MobileMenu
              links={links}
              secondary={[
                { href: "/#contact", label: "Contact" },
                { href: betaPath, label: betaLabel },
              ]}
            />
          </div>
        </div>
      </header>
    </>
  );
}
