import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/alpha/MobileMenu";
import { productUrl } from "@/app/site";

const links = [
  { href: "/#what", label: "What we do" },
  { href: "/research", label: "Research" },
  { href: "/case-studies", label: "Case studies" },
  { href: "/#how", label: "How it works" },
  { href: "/#oracle", label: "Try it" },
  { href: "/#replay", label: "Replay" },
  { href: "/#about", label: "About" },
];

export function AlphaHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/8 bg-background/95 md:bg-background/80 md:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="text-xl" aria-label="jargAI home">
          <Logo />
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-[15px] font-medium text-muted lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="hidden rounded-full border border-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-surface sm:inline-flex sm:px-5"
          >
            Contact
          </Link>
          <a
            href={productUrl}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:px-5"
          >
            Try the product
          </a>
          <MobileMenu links={[...links, { href: "/#contact", label: "Contact" }]} />
        </div>
      </div>
    </header>
  );
}
