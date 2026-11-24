import { PayoffGrid, type Move, type Player } from "@/components/alpha/PayoffGrid";
import { SectionHeading } from "@/components/alpha/SectionHeading";

const players: (Player & {
  tell: string;
  move: Move;
  tone: string;
})[] = [
  {
    name: "The early",
    tell: "Gets there before it's obvious, and keeps doing it.",
    move: "Follow",
    tone: "text-cyan border-cyan/40 bg-cyan/10",
    payoffs: { Follow: 1, Ignore: 0, Distrust: -1 },
    why: {
      Follow: "They move before everyone else, so moving with them tends to pay. Until others start copying them.",
      Ignore: "You miss the move, but you don't risk anything either.",
      Distrust: "Treating a real early mover like noise means throwing away your best clue.",
    },
  },
  {
    name: "The echo",
    tell: "Shows up after everyone else. Loud, sincere, and late.",
    move: "Ignore",
    tone: "text-muted border-white/15 bg-white/5",
    payoffs: { Follow: -1, Ignore: 0, Distrust: 0 },
    why: {
      Follow: "By the time the echo arrives, the move is mostly over. Following means buying in late.",
      Ignore: "There was never much there, so skipping it costs nothing.",
      Distrust: "Doesn't change much. There was nothing to gain from it anyway.",
    },
  },
  {
    name: "The ring",
    tell: "A group of accounts that keep posting about the same thing at the same time. Their hype is a warning, not a tip.",
    move: "Distrust",
    tone: "text-accent border-accent/40 bg-accent/10",
    payoffs: { Follow: -1, Ignore: 0, Distrust: 1 },
    why: {
      Follow: "The excitement is staged. Following it means falling for it.",
      Ignore: "Safe, but you miss the lesson. Spotting the setup is the valuable part.",
      Distrust: "Noticing the group is working together, and trusting it less, is the one move that helps.",
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
          title="Three kinds of people. Three different moves."
        >
          In a crowd, winning isn&apos;t about being right. It&apos;s about
          guessing what everyone else will do next. So the question isn&apos;t
          just &ldquo;what are they doing?&rdquo; It&apos;s &ldquo;who is
          doing it?&rdquo;
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
              We don&apos;t take part in, or encourage, hyping stocks. We study
              fake hype so people can spot it.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tap a box to see why. This grid shows the idea. We haven&apos;t
              published measured results for it.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted">
              <span className="font-semibold text-foreground">The catch:</span>{" "}
              once everyone copies the early people, they stop being early. So
              the model has to keep re-learning who&apos;s still ahead.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
