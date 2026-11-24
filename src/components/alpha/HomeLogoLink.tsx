"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import { Logo } from "@/components/Logo";

function scrollPageToTop() {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previous;
}

export function HomeLogoLink({ className = "text-xl" }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef(false);

  useEffect(() => {
    if (!pending.current || pathname !== "/") return;
    pending.current = false;
    scrollPageToTop();
    const retry = window.setTimeout(scrollPageToTop, 50);
    return () => window.clearTimeout(retry);
  }, [pathname]);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (pathname === "/") {
      if (window.location.hash) history.replaceState(null, "", "/");
      scrollPageToTop();
      return;
    }
    pending.current = true;
    router.push("/");
  }

  return (
    <Link href="/" aria-label="jargAI home" className={className} onClick={onClick}>
      <Logo />
    </Link>
  );
}
