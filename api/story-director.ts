type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (value: unknown) => void;
  end: () => void;
};
type ContentKind = "adventure" | "quiz" | "test" | "event";
type StoryPack = {
  id: string;
  kind: ContentKind;
  title: string;
  summary: string;
  chapter: string;
  location: string;
  storyText: string;
  unlockAtXp: number;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
};

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const allowedKinds = new Set<ContentKind>(["adventure", "quiz", "test", "event"]);
const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function send(res: ApiResponse, status: number, payload: unknown) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.json(payload);
}

function validPack(value: unknown, xp: number): StoryPack | null {
  if (!value || typeof value !== "object") return null;
  const p = value as Record<string, unknown>;
  const kind = p.kind as ContentKind;
  const options = Array.isArray(p.options) ? p.options.map(x => text(x, 160)).filter(Boolean).slice(0, 4) : [];
  const correctOption = Number(p.correctOption);
  if (!allowedKinds.has(kind) || options.length !== 4 || !Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) return null;
  const title = text(p.title, 70);
  const summary = text(p.summary, 220);
  const chapter = text(p.chapter, 60);
  const location = text(p.location, 50);
  const storyText = text(p.storyText, 900);
  const question = text(p.question, 240);
  const explanation = text(p.explanation, 300);
  if (!title || !summary || !chapter || !location || !storyText || !question || !explanation) return null;
  return {
    id: "ai-" + crypto.randomUUID(),
    kind,
    title,
    summary,
    chapter,
    location,
    storyText,
    unlockAtXp: xp + 100,
    question,
    options,
    correctOption,
    explanation
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed." });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin === "string" && typeof host === "string") {
    try {
      if (new URL(origin).host !== host) return send(res, 403, { error: "Cross-origin request blocked." });
    } catch {
      return send(res, 403, { error: "Invalid request origin." });
    }
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : "unknown").trim();
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (bucket && bucket.resetAt > now && bucket.count >= 3) {
    res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return send(res, 429, { error: "Story Director is resting. Try again later." });
  }
  if (!bucket || bucket.resetAt <= now) rateBuckets.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
  else bucket.count += 1;

  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const xp = Number(body.experience);
  const completedMissions = Number(body.completedMissions);
  const seenIds = Array.isArray(body.seenIds) ? body.seenIds.filter(x => typeof x === "string").slice(0, 20) : [];
  if (!Number.isFinite(xp) || xp < 0 || xp > 100000 || !Number.isFinite(completedMissions) || completedMissions < 0 || completedMissions > 100) {
    return send(res, 400, { error: "Invalid story progress." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return send(res, 503, { error: "Story Director is not configured yet. Add GEMINI_API_KEY in Vercel Environment Variables." });

  const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash").replace(/[^a-zA-Z0-9.-]/g, "");
  const prompt = [
    "You are the age-appropriate narrative content director for The School Chronicles, a fictional, non-violent school-life adventure at Hoshino Academy.",
    "Generate exactly ONE small content pack for a teen-friendly game. It must fit the existing continuity: transfer student, Aiko (friendly), Ren (competitive), Mika (creative), Hoshino Academy, school timetable, friendships, clubs, exams and the gradual mystery of the academy archives.",
    "Choose one kind: adventure, quiz, test, or event. Vary the kind. Keep it calm, inclusive, school-appropriate, non-romantic and non-violent. Never include dangerous dares, substances, sexual content, bullying instructions, real-world personal data, or frightening graphic content.",
    "Return ONLY valid JSON with keys kind,title,summary,chapter,location,storyText,question,options,correctOption,explanation.",
    "options must contain exactly four concise answer choices. correctOption is a zero-based integer. The question must be answerable and the explanation must confirm the correct answer. For an adventure/event, make the question a simple reflection/checkpoint about the scene.",
    "Do not generate code, URLs, HTML, scripts, API calls, or instructions to modify game files. Never contradict the supplied progress. Do not repeat seen IDs or titles.",
    "Progress: XP " + Math.floor(xp) + "; completed campus missions " + Math.floor(completedMissions) + "; previously generated IDs " + JSON.stringify(seenIds) + ".",
    "Keep this content a small next step, not a finale. The player should discover the wider world gradually."
  ].join("\n");

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, responseMimeType: "application/json", maxOutputTokens: 900 }
      }),
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      const failure = await response.text();
      console.error("Gemini Story Director error", response.status, failure.slice(0, 500));
      return send(res, 502, { error: "Gemini could not prepare the next story pack. Please try later." });
    }
    const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = result.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim() || "";
    const parsed = JSON.parse(raw) as unknown;
    const pack = validPack(parsed, Math.floor(xp));
    if (!pack) return send(res, 502, { error: "The generated story pack did not pass validation. Please try again later." });
    return send(res, 200, { pack, generatedAt: Date.now(), provider: "Gemini" });
  } catch (error) {
    console.error("Story Director request failed", error);
    return send(res, 502, { error: "Story Director is temporarily unavailable." });
  }
}
