"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MenuLink = { href: string; label: string };

export function MobileMenu({ links, secondary = [] }: { links: MenuLink[]; secondary?: MenuLink[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      ref.current?.removeAttribute("open");
      summaryRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <details
      ref={ref}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group relative lg:hidden"
    >
      <summary
        ref={summaryRef}
        className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 [&::-webkit-details-marker]:hidden"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-5 w-5 stroke-current"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M3 6h14M3 10h14M3 14h14" className="group-open:hidden" />
          <path d="M5 5l10 10M15 5L5 15" className="hidden group-open:block" />
        </svg>
      </summary>
      <nav
        aria-label="Mobile"
        className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-surface-elevated p-2 shadow-2xl"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => ref.current?.removeAttribute("open")}
            className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-white/5"
          >
            {link.label}
          </Link>
        ))}
        {secondary.length > 0 && (
          <div className="mt-2 border-t border-white/10 pt-2">
            {secondary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => ref.current?.removeAttribute("open")}
                className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </details>
  );
}
