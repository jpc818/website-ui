import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted md:flex-row">
        <Logo />
        <p>Bullish on wearable data.</p>
        <p>&copy; {new Date().getFullYear()} jargAI &middot; Jargai Labs LLC</p>
      </div>
    </footer>
  );
}
