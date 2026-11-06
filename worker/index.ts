import { replayRuns } from "../src/components/alpha/replayRuns";
import { dailyRunIndex, scoreRun, utcDay, weekStart } from "../src/components/alpha/replayScore";

const MAX_BODY_BYTES = 2048;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

const joinedPage = () =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>You're on the list · jargAI</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#090b0f;color:#f4f4f5;font-family:system-ui,sans-serif;text-align:center"><main><h1>You're on the list.</h1><p style="color:#b3bac5">Thanks. We'll be in touch when there's more to share.</p><p><a href="/" style="color:#22d3ee">Back to jargAI</a></p></main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );

async function readFields(request: Request) {
  const type = request.headers.get("Content-Type") ?? "";
  if (type.includes("application/json")) {
    const data = (await request.json()) as Record<string, unknown>;
    return { email: data.email, trap: data.website, isForm: false };
  }
  const form = await request.formData();
  return { email: form.get("email"), trap: form.get("website"), isForm: true };
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

type SignupKind = "access" | "newsletter";

const signupKinds: Record<SignupKind, { insert: string; label: string; subject: (email: string) => string }> = {
  access: {
    insert: "INSERT INTO signups (email, country) VALUES (?, ?) ON CONFLICT(email) DO NOTHING",
    label: "Project α early access",
    subject: (email) => `New access request: ${email}`,
  },
  newsletter: {
    insert: "INSERT INTO newsletter (email, country) VALUES (?, ?) ON CONFLICT(email) DO NOTHING",
    label: "the jargAI research newsletter",
    subject: (email) => `New newsletter signup: ${email}`,
  },
};

async function notifySignup(env: Env, kind: SignupKind, email: string, country: string | null) {
  const where = country ? ` from ${country}` : "";
  const { label, subject } = signupKinds[kind];
  try {
    await env.NOTIFY.send({
      from: { email: "waitlist@jarg.ai", name: "jargAI waitlist" },
      to: "jaronclinton88@gmail.com",
      replyTo: email,
      subject: subject(email),
      text: `New request for ${label}.\n\nEmail: ${email}\nCountry: ${country ?? "unknown"}\nTime: ${new Date().toISOString()}\n\nReply to this email to contact them directly.`,
      html: `<p>New request for ${escapeHtml(label)}${escapeHtml(where)}.</p><p><strong>${escapeHtml(email)}</strong></p><p style="color:#666">Reply to this email to contact them directly.</p>`,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    console.error("signup notification failed", code, error);
  }
}

async function handleSignup(request: Request, env: Env, ctx: ExecutionContext, kind: SignupKind): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }
  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request too large" }, 413);
  }

  let fields: Awaited<ReturnType<typeof readFields>>;
  try {
    fields = await readFields(request);
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  const done = () => (fields.isForm ? joinedPage() : json({ ok: true }));

  // Bots fill the hidden "website" field; pretend it worked.
  if (typeof fields.trap === "string" && fields.trap !== "") return done();

  const email =
    typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }

  const country =
    typeof request.cf?.country === "string" ? request.cf.country : null;
  const result = await env.DB.prepare(signupKinds[kind].insert).bind(email, country).run();

  if (result.meta.changes > 0) ctx.waitUntil(notifySignup(env, kind, email, country));

  return done();
}

// A daily-run result. The client sends only the day and its picks; the bankroll is recomputed here.
async function handleReplay(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }
  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request too large" }, 413);
  }

  let body: { day?: unknown; picks?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  const { day, picks } = body;
  if (!openDay(day)) {
    return json({ ok: false, error: "That run has closed." }, 400);
  }
  if (!Array.isArray(picks) || !picks.every((pick) => typeof pick === "string")) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
  const bankroll = scoreRun(replayRuns[dailyRunIndex(day)], picks);
  if (bankroll === null) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  const score = Math.round(bankroll);
  await env.DB.prepare("INSERT INTO replay_scores (day, bankroll) VALUES (?, ?)").bind(day, score).run();
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS players, COALESCE(SUM(bankroll < ?), 0) AS below FROM replay_scores WHERE day = ?",
  )
    .bind(score, day)
    .first<{ players: number; below: number }>();

  return json({ ok: true, bankroll: score, players: row?.players ?? 1, below: row?.below ?? 0, ...(await weekly(env, day)) });
}

const openDay = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && Math.abs(value - utcDay()) <= 1;

async function weekly(env: Env, day: number) {
  const start = weekStart(day);
  const row = await env.DB.prepare(
    "SELECT MAX(bankroll) AS best, COUNT(*) AS players FROM replay_scores WHERE day BETWEEN ? AND ?",
  )
    .bind(start, start + 6)
    .first<{ best: number | null; players: number }>();
  return { weekBest: row?.best ?? null, weekPlayers: row?.players ?? 0 };
}

async function handleWeekly(request: Request, env: Env): Promise<Response> {
  const day = Number(new URL(request.url).searchParams.get("day"));
  if (!openDay(day)) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
  return json({ ok: true, ...(await weekly(env, day)) }, 200, { "Cache-Control": "public, max-age=60" });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/replay") {
      if (request.method !== "POST" && request.method !== "GET") {
        return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "GET, POST" });
      }
      try {
        return request.method === "GET" ? await handleWeekly(request, env) : await handleReplay(request, env);
      } catch (error) {
        console.error("replay score failed", error);
        return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
      }
    }
    const kind: SignupKind | null =
      url.pathname === "/api/waitlist" ? "access" : url.pathname === "/api/newsletter" ? "newsletter" : null;
    if (kind) {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
      }
      try {
        return await handleSignup(request, env, ctx, kind);
      } catch (error) {
        console.error(`${kind} signup failed`, error);
        return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
