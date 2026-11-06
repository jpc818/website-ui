import { PayoffGrid, type Move, type Player } from "@/components/alpha/PayoffGrid";
import { SectionHeading } from "@/components/alpha/SectionHeading";

const players: (Player & {
  tell: string;
  move: Move;
  tone: string;
})[] = [
  {
    name: "The early",
    tell: "Acts before it's obvious, and keeps doing it on data they've never seen.",
    move: "Follow",
    tone: "text-cyan border-cyan/40 bg-cyan/10",
    payoffs: { Follow: 1, Ignore: 0, Discount: -1 },
    why: {
      Follow: "They move before it's obvious, so moving with them tends to pay. It lasts until they get copied.",
      Ignore: "You miss the move, but you take no risk either. Nothing gained, nothing lost.",
      Discount: "Marking down a real early mover as if they were noise means throwing away the best evidence there is.",
    },
  },
  {
    name: "The echo",
    tell: "Shows up after the crowd. Loud, sincere, and late.",
    move: "Ignore",
    tone: "text-muted border-white/15 bg-white/5",
    payoffs: { Follow: -1, Ignore: 0, Discount: 0 },
    why: {
      Follow: "The echo arrives after the move is mostly done. Following it means joining at the loud, late end.",
      Ignore: "There was never much in it, so skipping it costs nothing.",
      Discount: "Marking it down changes little. There was no edge in it to lose.",
    },
  },
  {
    name: "The ring",
    tell: "Accounts that keep acting together, on the same thing, at the same time. Their enthusiasm is a reason for caution, not a signal.",
    move: "Discount",
    tone: "text-accent border-accent/40 bg-accent/10",
    payoffs: { Follow: -1, Ignore: 0, Discount: 1 },
    why: {
      Follow: "A ring's enthusiasm is coordinated, not independent. Following it means following a staged signal.",
      Ignore: "Safe, but you learn nothing from it. Recognizing the pattern is where the value is.",
      Discount: "Spotting coordination and giving it less weight is the one move that helps here.",
    },
  },
];

export function TheGame() {
  return (
    <section
      id="game"
      aria-labelledby="game-title"
      className="border-t border-white/8 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          id="game-title"
          eyebrow="The game"
          title="Three kinds of players. Three different moves."
        >
          A crowd works like a beauty contest. Winning isn&apos;t about being
          right, it&apos;s about knowing what everyone else is about to do. So
          the question is never just &ldquo;what are they doing?&rdquo; but
          &ldquo;who is doing it?&rdquo;
        </SectionHeading>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            {players.map((player) => (
              <article
                key={player.name}
                className="rounded-3xl border border-white/8 bg-surface p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold">
                    {player.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-sm font-semibold ${player.tone}`}
                  >
                    {player.move}
                  </span>
                </div>
                <p className="mt-2 text-base leading-relaxed text-muted">
                  {player.tell}
                </p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-white/8 bg-surface p-5 sm:p-6">
            <PayoffGrid players={players} />
            <p className="mt-5 text-base leading-relaxed text-foreground">
              We don&apos;t take part in, or encourage, manipulating a crowd. We
              study coordinated activity so it can be recognized, not copied.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Discount</span> means
              treating a coordinated group&apos;s activity as weaker evidence
              than it looks. The boxes show the idea in the abstract. We
              haven&apos;t published measured results for it.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">The catch:</span>{" "}
              every edge fades once it&apos;s crowded. When the early get copied,
              they become the echo, so the model keeps re-learning who is still
              ahead.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
