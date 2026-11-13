import { CookieSettings } from "@/components/CookieBanner";
import { Logo } from "@/components/Logo";

export function AlphaFooter() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto max-w-6xl px-5 text-base text-muted sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <Logo className="text-lg text-foreground" />
          <p>Predicting what people do next.</p>
          <p>
            &copy; {new Date().getFullYear()} jargAI &middot; Jargai Labs LLC
          </p>
        </div>
        <nav aria-label="Site" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:justify-start">
          {[
            { href: "/research", label: "Research" },
            { href: "/case-studies", label: "Case studies" },
            { href: "/#about", label: "About" },
            { href: "/lab", label: "Lab" },
          ].map((link) => (
            <a key={link.href} href={link.href} className="underline underline-offset-2 hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <nav aria-label="Legal" className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:justify-start">
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy
          </a>
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </a>
          <CookieSettings />
          <a href="mailto:contact@jarg.ai" className="underline underline-offset-2 hover:text-foreground">
            contact@jarg.ai
          </a>
        </nav>
        <p className="mt-4 text-center text-xs leading-relaxed text-muted/80 md:text-left">
          jargAI is a research company. It does not manage money for others, sell signals, or give investment
          advice. Nothing on this site is financial, legal, tax, or other professional advice, or an offer or
          solicitation of any kind.
        </p>
      </div>
    </footer>
  );
}
