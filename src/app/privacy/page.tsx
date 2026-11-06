import type { Metadata } from "next";
import { activeGoogleAnalyticsId } from "@/app/site";
import { LegalPage } from "@/components/alpha/LegalPage";
import { JsonLd, pageJsonLd, pageMetadata } from "@/lib/seo";

const title = "Privacy Policy";
const description = "What jargAI collects when you visit jarg.ai or email us, and what we do with it.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/privacy" });

export default function Privacy() {
  return (
    <>
    <JsonLd data={pageJsonLd({ path: "/privacy", name: title, description, dateModified: "2026-11-02" })} />
    <LegalPage title={title} updated="November 2, 2026">
      <p>
        This page explains what we collect when you visit jarg.ai or email us, and what we do with it. It is written to
        be read, not to hide anything.
      </p>
      <p>
        jargAI is a brand operated by <strong className="text-foreground">Jargai Labs LLC</strong>, a Colorado limited
        liability company (&quot;we,&quot; &quot;us&quot;). We operate jarg.ai and are responsible for the personal
        information described here.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong className="text-foreground">Your email address and message</strong>, if you write to us.
        </li>
        <li>
          <strong className="text-foreground">Your email address, country and sign-up time</strong>, if you subscribe
          to our research notes. Country is estimated from your connection by our hosting provider.
        </li>
        <li>
          <strong className="text-foreground">Email addresses from our earlier early-access list</strong>. That list is
          no longer offered, and we keep those addresses only until you ask us to remove them.
        </li>
        <li>
          <strong className="text-foreground">Your Replay score</strong>, if you finish the day&apos;s run. We store the
          day, your final score and the time, with nothing that identifies you, to show how you did against other
          players. Your browser keeps its own copy of that day&apos;s result so it only counts once.
        </li>
        {activeGoogleAnalyticsId() ? (
          <li>
            <strong className="text-foreground">Your cookie choice</strong>, if you accept or reject analytics cookies.
            A first-party cookie named jarg_consent stores that choice and the time you made it, for six months.
          </li>
        ) : null}
      </ul>
      {activeGoogleAnalyticsId() ? (
        <>
          <p>
            We use Google Analytics to see which pages people visit, and a few actions such as subscribing to the
            research notes or opening the contact email. Analytics cookies stay off unless you accept them. Accepting
            lets Google store a cookie that can recognize this browser on a later visit. If you reject them, or you
            have not chosen yet, that cookie is not stored.
          </p>
          <p>
            Google still receives a cookieless measurement of those pages and actions: the page address, a rough
            location, and the type of browser. It is not tied to an analytics cookie. We do this to understand how the
            site is used. We do not use it for advertising, and we do not send your email address to Google.
          </p>
          <p>
            The &quot;Try to be unpredictable&quot; demo runs entirely in your browser, and your taps are never sent
            anywhere. Our hosting provider may keep basic technical logs (such as IP address and request time) to keep
            the site secure and running.
          </p>
          <p>
            If you accept or reject, we remember that choice for six months so we do not ask on every visit. You can
            change it from Cookies at the bottom of any page. Rejecting also deletes analytics cookies already stored
            on this device. After six months, we ask again.
          </p>
        </>
      ) : (
        <p>
          We do not use advertising trackers or analytics cookies on this site. The &quot;Try to be
          unpredictable&quot; demo runs entirely in your browser, and your taps are never sent anywhere. Our hosting
          provider may keep basic technical logs (such as IP address and request time) to keep the site secure and
          running.
        </p>
      )}

      <h2>How we use it</h2>
      <ul>
        <li>To reply to you.</li>
        <li>To send the research notes you subscribed to. You can unsubscribe at any time.</li>
        <li>To keep the site secure and stop abuse.</li>
        {activeGoogleAnalyticsId() ? <li>To see how the site is used.</li> : null}
      </ul>
      <p>We do not rent out or hand over your email address, and we do not use it for advertising.</p>

      <h2>Who handles it</h2>
      <p>
        We use Cloudflare to host this site, store sign-up lists, and deliver the notification email we receive when
        someone subscribes. Cloudflare processes that information on our behalf.
        {activeGoogleAnalyticsId() ? (
          <>
            {" "}
            Google Analytics, run by Google, receives the page and event measurements described above. We do not send
            your email address to Google.
          </>
        ) : null}{" "}
        We do not share your email address with anyone else, except where the law requires it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us at any time to tell you what we hold about you, correct it, or delete it. Depending on where you
        live, you may have additional rights under laws such as the GDPR or the CCPA/CPRA. To use any of them, email{" "}
        <a href="mailto:contact@jarg.ai">contact@jarg.ai</a>. We will respond within 30 days.
      </p>

      <h2>Children</h2>
      <p>This site is not meant for anyone under 16, and we do not knowingly collect their information.</p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date above.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href="mailto:contact@jarg.ai">contact@jarg.ai</a>.
      </p>
    </LegalPage>
    </>
  );
}
