import type { Metadata } from "next";
import { LegalPage } from "@/components/alpha/LegalPage";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const title = "Terms of Use";
const description = "The terms for using jarg.ai, including the limits of what the site can be relied on for.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/terms" });

export default function Terms() {
  return (
    <>
    <JsonLd data={pageJsonLd({ path: "/terms", name: title, description, dateModified: "2026-11-02" })} />
    <LegalPage title={title} updated="November 3, 2026">
      <p>By using jarg.ai you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>Who operates this site</h2>
      <p>
        jargAI is a brand operated by <strong className="text-foreground">Jargai Labs LLC</strong>, a Colorado
        limited liability company. In these terms, &quot;we,&quot; &quot;us,&quot; and &quot;jargAI&quot; mean Jargai
        Labs LLC unless the context says otherwise.
      </p>

      <h2>Not advice</h2>
      <p>
        jargAI is a research company. It does not manage money for others, sell signals, or offer investment advice.
        Nothing on this site is financial, legal, tax, or other professional advice, and nothing here is an offer or a
        solicitation of any kind, including an offer to invest in jargAI. We are not your adviser, and we have no duty
        to you in that role.
      </p>

      <h2>No guarantees, and examples are illustrative</h2>
      <p>
        Case studies, graphics, scores, and numbers on this site are examples meant to explain how we think. They are
        not a promise or a forecast of future results. Past performance does not predict future results. Any single
        example may not be typical.
      </p>
      <p>
        Some figures are simulated rather than traded. Where the site shows what a set of rules would have done on
        past prices, including the investment tool on the research page, no money was at risk and the result was
        produced by replaying historical data. It is not a record of trading. Simulated results carry advantages that
        real trading does not, and they are shown before commission, slippage, borrow cost, and market impact. The
        tool is published so the method can be examined and argued with, not as a recommendation to buy or sell
        anything.
      </p>

      <h2>Using the site</h2>
      <ul>
        <li>Do not submit someone else&apos;s email address without their permission.</li>
        <li>Do not misuse the site, attempt to break or overload it, or probe it for vulnerabilities.</li>
        <li>Do not copy or republish the site&apos;s content or graphics as your own.</li>
      </ul>

      <h2>Our content</h2>
      <p>
        The text, graphics, and code on this site belong to Jargai Labs LLC unless noted. You may link to the site and quote
        short passages with credit.
      </p>

      <h2>No warranty and limits on liability</h2>
      <p>
        The site and its content are provided &quot;as is,&quot; without warranties of any kind. To the fullest extent
        the law allows, Jargai Labs LLC is not liable for losses or damages that result from using, or relying on, this site or
        its content.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. If we do, we will change the date above. Using the site afterward means you accept the changes.</p>

      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:contact@jarg.ai">contact@jarg.ai</a>. See also our <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalPage>
    </>
  );
}
