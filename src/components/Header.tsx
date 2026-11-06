import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/8 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="text-lg">
          <Logo />
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#thesis" className="transition-colors hover:text-foreground">
            Our thesis
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#wearables" className="transition-colors hover:text-foreground">
            Wearables
          </a>
        </nav>
        <a
          href="#contact"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Get early access
        </a>
      </div>
    </header>
  );
}
