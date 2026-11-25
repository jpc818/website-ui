import Link from "next/link";
import { SectionHeading } from "@/components/alpha/SectionHeading";
import { researchNotes } from "@/components/alpha/researchNoteList";

export function ResearchNotes() {
  return (
    <section id="notes" aria-labelledby="notes-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading id="notes-title" eyebrow="Research notes" title="What we tried, and what we'll test next.">
          Longer write-ups, each on its own page: ideas that didn&apos;t work, and tests we fixed in advance.
        </SectionHeading>
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {researchNotes.map((note) => (
            <li key={note.path}>
              <Link
                href={note.path}
                className="group flex h-full flex-col rounded-3xl border border-white/8 bg-surface p-6 transition-colors hover:border-white/20 md:p-7"
              >
                <span className="font-mono text-sm font-semibold uppercase tracking-wider text-accent">{note.eyebrow}</span>
                <span className="mt-3 font-[family-name:var(--font-heading)] text-xl font-bold md:text-2xl">
                  {note.title}
                </span>
                <span className="mt-2 text-base leading-relaxed text-muted">{note.summary}</span>
                <span className="mt-auto pt-5 text-sm text-muted">
                  <span className="font-mono">Published {note.published}</span>
                  <span className="ml-3 font-semibold text-accent group-hover:underline">Read →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
