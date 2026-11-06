const devices = [
  "Meta Ray-Ban & Orion",
  "Apple Vision Pro",
  "Enterprise AR headsets",
  "Body-worn cameras",
];

const dataStreams = [
  "Video + depth",
  "Audio transcripts",
  "GPS + IMU telemetry",
  "Voice commands",
  "Ambient context",
];

const outputs = [
  "Progress tracking",
  "Safety compliance",
  "Material inventory",
  "As-built documentation",
  "Punch list generation",
  "RFI support data",
];

export function Wearables() {
  return (
    <section id="wearables" className="border-t border-white/8 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-cyan">
              The jargAI stack
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight md:text-4xl">
              Wearable in. Structured data out.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              We ingest multimodal feeds from whatever wearable ships next,
              run them through field-tuned vision and language models, and
              deliver clean data via API — the intelligence layer the wearable
              ecosystem is missing.
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Input devices
                </p>
                <ul className="mt-4 space-y-3">
                  {devices.map((device) => (
                    <li key={device} className="flex items-center gap-3 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                      {device}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Data streams we capture
                </p>
                <ul className="mt-4 space-y-3">
                  {dataStreams.map((stream) => (
                    <li key={stream} className="flex items-center gap-3 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {stream}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-surface-elevated p-8">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                jargAI · live output
              </span>
              <span className="flex items-center gap-1.5 text-xs text-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
                Ingesting wearable feed
              </span>
            </div>

            <div className="mt-6 space-y-4 font-mono text-sm">
              <div className="rounded-lg bg-background p-4">
                <span className="text-muted">source:</span>{" "}
                <span className="text-cyan">meta_rayban · foreman_042</span>
              </div>
              <div className="rounded-lg bg-background p-4">
                <span className="text-muted">site_id:</span>{" "}
                <span className="text-accent">tower-b-east</span>
              </div>
              <div className="rounded-lg bg-background p-4">
                <span className="text-muted">floor_progress:</span>{" "}
                <span className="text-foreground">78%</span>
              </div>
              <div className="rounded-lg bg-background p-4">
                <span className="text-muted">safety_flags:</span>{" "}
                <span className="text-accent">2 open</span>
              </div>
              <div className="rounded-lg bg-background p-4">
                <span className="text-muted">materials_detected:</span>{" "}
                <span className="text-foreground">rebar, formwork, conduit</span>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Structured outputs
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {outputs.map((output) => (
                  <span
                    key={output}
                    className="rounded-full border border-white/10 bg-background px-3 py-1 text-xs text-muted"
                  >
                    {output}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
