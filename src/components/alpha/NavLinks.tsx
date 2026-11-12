"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return links.map((link) => {
    const current = !link.href.includes("#") && (pathname === link.href || pathname.startsWith(`${link.href}/`));
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={current ? "page" : undefined}
        className={`transition-colors hover:text-foreground ${current ? "text-foreground underline decoration-accent decoration-2 underline-offset-8" : ""}`}
      >
        {link.label}
      </Link>
    );
  });
}
