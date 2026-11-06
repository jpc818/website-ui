export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-[family-name:var(--font-heading)] font-bold tracking-tight ${className}`}>
      jarg<span className="text-cyan">AI</span>
    </span>
  );
}
