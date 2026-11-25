import {
  BRIEFING_FIRM_MAX,
  BRIEFING_NAME_MAX,
  briefingRoles,
  isBriefingRole,
  type BriefingRole,
} from "../src/components/alpha/briefing";
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

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

// Name and firm reach an email subject line, so control characters (including line breaks) are refused.
function cleanText(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > max || CONTROL_CHARS.test(text) ? null : text;
}

type Briefing = { role: BriefingRole; name: string; email: string; firm: string };

async function notifyBriefing(env: Env, briefing: Briefing, country: string | null) {
  const role = briefingRoles.find((r) => r.id === briefing.role)?.label ?? briefing.role;
  const waitlist = briefing.role === "individual";
  const kind = waitlist ? "Beta waitlist" : "Research briefing request";
  const rows: [string, string][] = [
    ["Role", role],
    ["Name", briefing.name],
    ["Email", briefing.email],
    ...(briefing.firm ? ([["Firm", briefing.firm]] as [string, string][]) : []),
    ["Country", country ?? "unknown"],
  ];
  try {
    await env.NOTIFY.send({
      from: { email: "waitlist@jarg.ai", name: "jargAI website" },
      to: "jaronclinton88@gmail.com",
      replyTo: briefing.email,
      subject: `${kind}: ${briefing.name} (${role})`,
      text: `${kind}.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\nTime: ${new Date().toISOString()}\n\nReply to this email to contact them directly.`,
      html: `<p>${escapeHtml(kind)}.</p><table>${rows.map(([k, v]) => `<tr><td style="color:#666;padding-right:12px">${k}</td><td><strong>${escapeHtml(v)}</strong></td></tr>`).join("")}</table><p style="color:#666">Reply to this email to contact them directly.</p>`,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    console.error("briefing notification failed", code, error);
  }
}

async function handleBriefing(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) {
    return json({ ok: false, error: "Forbidden" }, 403);
  }
  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Request too large" }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Bots fill the hidden "website" field; pretend it worked.
  if (typeof body.website === "string" && body.website !== "") return json({ ok: true });

  const role = body.role;
  if (!isBriefingRole(role)) {
    return json({ ok: false, error: "Please choose the option that describes you." }, 400);
  }
  const name = cleanText(body.name, BRIEFING_NAME_MAX);
  if (!name) {
    return json({ ok: false, error: "Please enter your name." }, 400);
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  const firm = role === "individual" ? "" : cleanText(body.firm, BRIEFING_FIRM_MAX);
  if (firm === null) {
    return json({ ok: false, error: "Please shorten the firm name." }, 400);
  }

  const country = typeof request.cf?.country === "string" ? request.cf.country : null;
  const result = await env.DB.prepare(
    "INSERT INTO briefing_requests (email, role, name, firm, country) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING",
  )
    .bind(email, role, name, firm || null, country)
    .run();

  if (result.meta.changes > 0) ctx.waitUntil(notifyBriefing(env, { role, name, email, firm }, country));

  return json({ ok: true });
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
  await env.DB.prepare("INSERT INTO replay_scores (day, bankroll, picks) VALUES (?, ?, ?)")
    .bind(day, score, picks.join(","))
    .run();
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

const MAX_SPLIT_ROWS = 5000;

// How the day's players called each session. null for a session nobody bet on, or one with nothing to play.
async function splits(env: Env, day: number) {
  const sessions = replayRuns[dailyRunIndex(day)].sessions.length;
  const counts = Array.from({ length: sessions }, () => ({ rise: 0, drop: 0, out: 0 }));
  const { results } = await env.DB.prepare(
    "SELECT picks FROM replay_scores WHERE day = ? AND picks IS NOT NULL ORDER BY id DESC LIMIT ?",
  )
    .bind(day, MAX_SPLIT_ROWS)
    .all<{ picks: string }>();
  for (const row of results) {
    row.picks.split(",").forEach((code, i) => {
      const side = code[0] === "r" ? "rise" : code[0] === "d" ? "drop" : code[0] === "o" ? "out" : null;
      if (side && i < sessions) counts[i][side]++;
    });
  }
  return counts.map((c) => (c.rise + c.drop + c.out ? c : null));
}

async function handleWeekly(request: Request, env: Env): Promise<Response> {
  const day = Number(new URL(request.url).searchParams.get("day"));
  if (!openDay(day)) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
  const [week, split] = await Promise.all([weekly(env, day), splits(env, day)]);
  return json({ ok: true, ...week, splits: split }, 200, { "Cache-Control": "public, max-age=60" });
}

// Publication-test scoreboard. The trading system re-sends every released call each morning.
const MAX_CALLS_BODY_BYTES = 2 * 1024 * 1024;
const MAX_CALLS = 10_000;
// Each statement binds one JSON array; D1 caps a bound value at 2 MB and a batch's statements count toward the
// per-invocation query limit, so calls go in a few large chunks rather than one statement each.
const CALLS_PER_STATEMENT = 1000;
const ENTRY_DAY = /^\d{4}-\d{2}-\d{2}$/;
const TICKER = /^[A-Z][A-Z0-9.\-]{0,9}$/;
const MAX_RELEASED_AT_LENGTH = 64;

type PublicCall = {
  entry_day: string;
  ticker: string;
  crash_pct: number | null;
  price: number | null;
  released_at: string | null;
  published_before_outcome: 0 | 1 | null;
  excess_return: number | null;
  big_drop: 0 | 1 | null;
};

const finiteOrNull = (value: unknown): value is number | null =>
  value === null || (typeof value === "number" && Number.isFinite(value));
const booleanOrNull = (value: unknown): value is boolean | null => value === null || typeof value === "boolean";
const flag = (value: boolean | null) => (value === null ? null : value ? 1 : 0);

function parseCall(value: unknown): PublicCall | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const call = value as Record<string, unknown>;
  const { entry_day, ticker, crash_pct, price, released_at, published_before_outcome, excess_return, big_drop } = call;
  if (typeof entry_day !== "string" || !ENTRY_DAY.test(entry_day)) return null;
  if (typeof ticker !== "string" || !TICKER.test(ticker)) return null;
  if (!finiteOrNull(crash_pct) || !finiteOrNull(price) || !finiteOrNull(excess_return)) return null;
  if (!booleanOrNull(published_before_outcome) || !booleanOrNull(big_drop)) return null;
  if (
    released_at !== null &&
    (typeof released_at !== "string" || released_at.length > MAX_RELEASED_AT_LENGTH || CONTROL_CHARS.test(released_at))
  ) {
    return null;
  }
  return {
    entry_day,
    ticker,
    crash_pct,
    price,
    released_at,
    published_before_outcome: flag(published_before_outcome),
    excess_return,
    big_drop: flag(big_drop),
  };
}

// Stops reading once the body passes the limit, so a missing or false Content-Length can't force a large read.
async function readLimitedText(request: Request, max: number): Promise<string | null> {
  if (Number(request.headers.get("Content-Length") ?? 0) > max) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

// Hashing both sides first gives equal-length inputs, which timingSafeEqual requires.
async function sameSecret(given: string, expected: string) {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(given)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

const UPSERT_CALLS = `INSERT INTO public_calls (entry_day, ticker, crash_pct, price, released_at, published_before_outcome, excess_return, big_drop, first_received_at, updated_at)
SELECT json_extract(value, '$.entry_day'), json_extract(value, '$.ticker'), json_extract(value, '$.crash_pct'),
  json_extract(value, '$.price'), json_extract(value, '$.released_at'), json_extract(value, '$.published_before_outcome'),
  json_extract(value, '$.excess_return'), json_extract(value, '$.big_drop'), ?, ?
FROM json_each(?) WHERE true
ON CONFLICT (entry_day, ticker) DO UPDATE SET
  crash_pct = excluded.crash_pct,
  price = excluded.price,
  released_at = excluded.released_at,
  published_before_outcome = excluded.published_before_outcome,
  excess_return = excluded.excess_return,
  big_drop = excluded.big_drop,
  updated_at = excluded.updated_at`;

async function handlePostCalls(request: Request, env: Env): Promise<Response> {
  const header = request.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!env.PUBLICATION_POST_TOKEN) console.error("PUBLICATION_POST_TOKEN is not set");
  if (!env.PUBLICATION_POST_TOKEN || !token || !(await sameSecret(token, env.PUBLICATION_POST_TOKEN))) {
    return json({ ok: false, error: "Unauthorized" }, 401, { "WWW-Authenticate": "Bearer" });
  }

  const text = await readLimitedText(request, MAX_CALLS_BODY_BYTES);
  if (text === null) {
    return json({ ok: false, error: "Request too large" }, 413);
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return json({ ok: false, error: "Body must be an object" }, 400);
  }
  const { generated_at, calls } = body as Record<string, unknown>;
  if (typeof generated_at !== "string" || generated_at.length > MAX_RELEASED_AT_LENGTH) {
    return json({ ok: false, error: "generated_at must be a string" }, 400);
  }
  if (!Array.isArray(calls) || calls.length > MAX_CALLS) {
    return json({ ok: false, error: `calls must be an array of at most ${MAX_CALLS} items` }, 400);
  }
  const parsed: PublicCall[] = [];
  for (let i = 0; i < calls.length; i++) {
    const call = parseCall(calls[i]);
    if (!call) return json({ ok: false, error: `Invalid call at index ${i}` }, 400);
    parsed.push(call);
  }

  if (parsed.length > 0) {
    const now = new Date().toISOString();
    const statement = env.DB.prepare(UPSERT_CALLS);
    const statements = [];
    for (let i = 0; i < parsed.length; i += CALLS_PER_STATEMENT) {
      statements.push(statement.bind(now, now, JSON.stringify(parsed.slice(i, i + CALLS_PER_STATEMENT))));
    }
    await env.DB.batch(statements);
  }
  return json({ ok: true, calls: parsed.length });
}

async function handleGetCalls(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT entry_day, ticker, crash_pct, price, released_at, published_before_outcome, excess_return, big_drop FROM public_calls ORDER BY entry_day DESC, ticker ASC",
  ).all<PublicCall>();
  const calls = results.map((row) => ({
    ...row,
    published_before_outcome: row.published_before_outcome === null ? null : row.published_before_outcome === 1,
    big_drop: row.big_drop === null ? null : row.big_drop === 1,
  }));
  return json({ calls }, 200, { "Cache-Control": "public, max-age=60" });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/calls") {
      if (request.method !== "POST" && request.method !== "GET") {
        return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "GET, POST" });
      }
      try {
        return request.method === "GET" ? await handleGetCalls(env) : await handlePostCalls(request, env);
      } catch (error) {
        console.error("calls request failed", error);
        return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
      }
    }
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
    if (url.pathname === "/api/briefing") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
      }
      try {
        return await handleBriefing(request, env, ctx);
      } catch (error) {
        console.error("briefing request failed", error);
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
