import Link from "next/link";

export function LabTeaser() {
  return (
    <section aria-label="Lab" className="border-t border-white/8 py-10 md:py-12">
      <p className="mx-auto max-w-6xl px-5 text-lg leading-relaxed text-muted sm:px-6">
        Think you&apos;re hard to predict? Two interactive demos are in the{" "}
        <Link
          href="/lab"
          className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          Lab →
        </Link>
      </p>
    </section>
  );
}
