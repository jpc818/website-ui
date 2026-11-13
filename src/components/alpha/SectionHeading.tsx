import type { ReactNode } from "react";

export function SectionHeading({
  id,
  eyebrow,
  title,
  level: Heading = "h2",
  children,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  level?: "h1" | "h2";
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-cyan">
        {eyebrow}
      </p>
      <Heading
        id={id}
        className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-heading)] text-[clamp(1.875rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight"
      >
        {title}
      </Heading>
      {children && (
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted md:text-xl">
          {children}
        </p>
      )}
    </div>
  );
}
