import type { Metadata } from "next";
import Link from "next/link";
import { ResearchArticle } from "@/components/alpha/ResearchArticle";
import { researchNotes } from "@/components/alpha/researchNoteList";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const note = researchNotes[0];
const path = note.path;
const title = "Pre-registration: does publishing a drop call change the outcome?";
const description =
  "A randomized test, fixed in advance, of whether publishing a jargAI drop call changes what the stock does. Half of eligible calls go public the same morning, half after the outcome. It starts on the first trading day after the public scoreboard launches.";

const documentPath = "/preregistration-publication-test.md";
const documentSha256 = "5a95eb02f8ce3256d11fe9b699c8df44023a2ba9aa359e0aee8c2b1128ace704";
const saltCommitment = "3b1ed3cf877f55c6225ff0917ef21c942f88333cfa26dc0545cb8f48c197400b";

export const metadata: Metadata = pageMetadata({ title, description, path });

const fingerprints = [
  { label: "Pre-registration document SHA-256", value: documentSha256 },
  {
    label: "Assignment salt commitment (SHA-256 of a secret revealed when the test ends)",
    value: saltCommitment,
  },
];

export default function PublicationTest() {
  return (
    <>
      <JsonLd
        data={pageJsonLd({
          path,
          name: title,
          description,
          dateModified: note.isoDate,
          parent: { name: "Research", path: "/research" },
          extra: { datePublished: note.isoDate },
        })}
      />
      <ResearchArticle
        eyebrow={note.eyebrow}
        title={note.title}
        published={note.published}
        intro={
          <>
            We&apos;re about to start a fair test of whether our own warnings move the stocks they&apos;re about. We wrote
            down the plan, the measurements and the size of the test before seeing a single result, and fingerprinted the
            document so we can&apos;t quietly change it later.
          </>
        }
      >
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/[0.04] p-6 md:p-7">
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-amber-400">Not started yet</p>
          <p className="mt-2 text-base leading-relaxed text-foreground">
            The test starts on the first trading day after the launch of the{" "}
            <Link href="/scoreboard">public scoreboard</Link>, where its calls will appear. Until then, no calls are
            being assigned and there are no results.
          </p>
        </div>

        <h2>The question</h2>
        <p>
          jargAI ranks US stocks that people are talking about online by how likely they are to drop at least 10% behind
          the S&amp;P 500 over the next three trading days. Once those drop calls are public, they become one more thing
          the crowd can read.
        </p>
        <p>
          That&apos;s the problem. A published warning is itself crowd information. People might pile in behind it and
          sell, so the warning makes itself come true. Or traders might bet against it, so it defeats itself. Either way,
          the crowd would be reacting to the warning instead of the stock, and a public track record would no longer
          measure what we think it measures. We want to know which, if either, happens. A change in either direction
          counts.
        </p>

        <h2>The design</h2>
        <ul>
          <li>
            <strong>Which calls.</strong> Every live drop call in our top 20% from the start date on. Calls filled in
            after the fact don&apos;t count.
          </li>
          <li>
            <strong>Two groups.</strong> Each call goes into one of two groups. In the <em>publish</em> group, it appears
            on the <Link href="/scoreboard">public scoreboard</Link> the same morning, about ten minutes after the market
            opens. In the <em>hold</em> group, it appears only after its three trading days have closed.
          </li>
          <li>
            <strong>A fair coin nobody can steer.</strong> The group is picked by a fair coin flip for each call,
            computed from a secret and the stock and date. It&apos;s recorded when the call is made and never changed.
            We&apos;ve published a fingerprint of the secret below, and we&apos;ll reveal the secret itself when the test
            ends, so anyone can redo every flip.
          </li>
          <li>
            <strong>Every call is published eventually.</strong> Nothing is hidden. Only the timing differs.
          </li>
          <li>
            <strong>Both groups are treated the same.</strong> Calls in both groups are scored, traded and sized by the
            same rules.
          </li>
        </ul>

        <h2>What we&apos;ll measure</h2>
        <p>
          The main result is the <strong>hard-drop rate</strong>: how often a call is followed by the stock falling at
          least 10% behind the S&amp;P 500, from that morning&apos;s open to the close three trading days later. The
          effect is the publish group&apos;s rate minus the hold group&apos;s rate. We&apos;ll also report the average
          move against the S&amp;P 500 and whether online attention picks up, but those only count as supporting
          evidence.
        </p>

        <h2>How big, and how long</h2>
        <p>
          The analysis runs once, after 900 calls have finished, which should take about 12 months. That&apos;s about{" "}
          <span className="font-mono tabular-nums text-foreground">452</span> calls in each group. We won&apos;t look at
          the results before then. A test this size has an 80% chance of spotting a difference of{" "}
          <span className="font-mono tabular-nums text-foreground">9.3</span> percentage points in the hard-drop rate,
          or <span className="font-mono tabular-nums text-foreground">4.1</span> points in the average move against the
          S&amp;P 500. Smaller effects could be real and still slip past it.
        </p>
        <p>
          If we find nothing, we&apos;ll say &ldquo;no effect we could detect at this audience size,&rdquo; not
          &ldquo;publishing has no effect.&rdquo; Our audience starts small, and an effect could grow as more people
          read the scoreboard.
        </p>

        <h2>We&apos;ll publish the result either way</h2>
        <p>
          Whether publishing turns out to help our calls, hurt them, or do nothing we can see, the result goes on this
          site, along with the secret so the coin flips can be checked. Any change to the plan after the start goes in a
          dated log at the end of the document, with the reason.
        </p>

        <h2>Check it yourself</h2>
        <p>
          The full plan is in the{" "}
          <a href={documentPath} download>
            pre-registration document
          </a>
          . A SHA-256 fingerprint is a short code computed from a file&apos;s exact contents. Change one character and
          the code changes completely, so if the file you download matches the code below, it&apos;s the same document
          we published on {note.published}.
        </p>
        <dl className="space-y-4 rounded-3xl border border-white/8 bg-surface p-6 md:p-7">
          {fingerprints.map((item) => (
            <div key={item.label}>
              <dt className="text-sm font-semibold text-foreground">{item.label}</dt>
              <dd className="mt-1 break-all font-mono text-sm text-cyan">{item.value}</dd>
            </div>
          ))}
        </dl>
        <ol>
          <li>
            Download the file. Save it rather than copying the text out of your browser, which can change spacing.
          </li>
          <li>
            Compute its SHA-256. On Windows (PowerShell):{" "}
            <code className="break-words font-mono text-sm text-foreground">
              Get-FileHash -Algorithm SHA256 preregistration-publication-test.md
            </code>
            . On a Mac or Linux:{" "}
            <code className="break-words font-mono text-sm text-foreground">
              shasum -a 256 preregistration-publication-test.md
            </code>
            .
          </li>
          <li>Compare the result with the document fingerprint above. Capital letters don&apos;t matter.</li>
        </ol>
        <p>
          When the test ends we&apos;ll reveal the secret. Its SHA-256 should match the salt commitment above, which shows
          we didn&apos;t swap it to steer which calls went public.
        </p>
      </ResearchArticle>
    </>
  );
}
