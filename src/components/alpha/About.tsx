import { founder } from "@/app/site";
import { SectionHeading } from "@/components/alpha/SectionHeading";

const INK = "#1c1917";

function Adult({
  x,
  hair,
  dress,
}: {
  x: number;
  hair?: boolean;
  dress?: boolean;
}) {
  return (
    <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {hair && <path d={`M${x - 16} 46 Q${x} 24 ${x + 16} 46`} />}
      <circle cx={x} cy="52" r="16" fill="#f5f5f4" />
      {dress ? (
        <path d={`M${x} 68 L${x - 20} 124 L${x + 20} 124 Z`} fill="#f5f5f4" />
      ) : (
        <path d={`M${x} 68 V122`} />
      )}
      <path d={`M${x} 84 L${x - 26} 102`} />
      <path d={`M${x} 84 L${x + 26} 102`} />
      <path d={`M${x - (dress ? 10 : 0)} ${dress ? 124 : 122} L${x - 16} 168`} />
      <path d={`M${x + (dress ? 10 : 0)} ${dress ? 124 : 122} L${x + 16} 168`} />
    </g>
  );
}

function Boy({ x, h }: { x: number; h: number }) {
  const head = 168 - h;
  return (
    <g stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx={x} cy={head - 11} r="11" fill="#f5f5f4" />
      <path d={`M${x} ${head} V${head + h * 0.46}`} />
      <path d={`M${x} ${head + 16} L${x - 16} ${head + 32}`} />
      <path d={`M${x} ${head + 16} L${x + 16} ${head + 32}`} />
      <path d={`M${x} ${head + h * 0.46} L${x - 12} 168`} />
      <path d={`M${x} ${head + h * 0.46} L${x + 12} 168`} />
    </g>
  );
}

function FamilySketch() {
  return (
    <svg viewBox="0 0 300 188" role="img" aria-label="Stick-figure drawing of Jaron, his wife, and their three boys" className="h-auto w-full">
      <path d="M18 168 H282" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
      <Adult x={58} />
      <Adult x={112} hair dress />
      <Boy x={176} h={78} />
      <Boy x={220} h={66} />
      <Boy x={258} h={52} />
    </svg>
  );
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-white/8 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <div className="mx-auto w-full max-w-xs space-y-5 lg:max-w-none">
          {founder.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={founder.photo.src}
              alt={founder.photo.alt}
              className="aspect-square w-full rounded-3xl border border-white/10 object-cover"
            />
          )}
          <figure>
            <div className="rounded-3xl border border-black/10 bg-[#f5f5f4] px-4 pb-5 pt-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <FamilySketch />
              <figcaption className="mt-2 text-center font-mono text-xs text-black/55">My wife, our three boys, and me. Not to scale.</figcaption>
            </div>
          </figure>
        </div>
        <div>
          <SectionHeading id="about-title" eyebrow="About" title="Hi, I&apos;m Jaron Clinton.">
            The idea showed up years before jargAI did.
          </SectionHeading>
          <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-muted md:text-lg">
            <p>
              I went to business school and spent a lot of it in the finance club. Then came a startup that went well.
              Then Discount Tire, the world&apos;s largest independent tire dealer.
            </p>
            <p>
              Years in retail taught me one thing I never stopped thinking about: watch enough people and they get
              surprisingly predictable. Not any one person, but the crowd as a whole.
            </p>
            <p>
              Shoppers are a much easier problem than public posts about stocks. jargAI is my own project, built on my
              own time with my own equipment and public data, to find out how much of that predictability survives in
              markets, and what could be built on whatever does.
            </p>
            <p>
              By trade I&apos;m a cloud architect. I design and run the systems that let AI agents do real work
              reliably, and jargAI is built with the same discipline, starting with scoring the model only on data it
              never saw.
            </p>
            <p>
              These days I work for a large multinational company. Home is my wife and our three boys, who are far
              harder to predict than any crowd.
            </p>
            {(founder.credential || founder.linkedinUrl) && (
              <p className="text-base text-foreground">
                {founder.credential}
                {founder.credential && founder.linkedinUrl ? " · " : ""}
                {founder.linkedinUrl && (
                  <a
                    href={founder.linkedinUrl}
                    rel="noopener noreferrer"
                    className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
                  >
                    Jaron on LinkedIn →
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
