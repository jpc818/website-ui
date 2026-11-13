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
