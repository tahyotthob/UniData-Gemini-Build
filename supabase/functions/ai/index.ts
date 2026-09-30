// Supabase Edge Function: server-side AI proxy for Unidata.
// Works with any OpenAI-compatible chat-completions API (Groq, OpenRouter, Together, OpenAI, Ollama...).
// Secrets (never shipped to the browser):
//   AI_API_KEY   - provider key
//   AI_BASE_URL  - default https://api.groq.com/openai/v1
//   AI_MODEL     - default llama-3.3-70b-versatile
//   AI_DAILY_LIMIT - max requests per signed-in user per day (default 40)
//   AI_ANON_DAILY_LIMIT - max requests per anonymous visitor (by IP) per day (default 5)

const BASE_URL = Deno.env.get('AI_BASE_URL') ?? 'https://api.groq.com/openai/v1';
const API_KEY = Deno.env.get('AI_API_KEY') ?? '';
const MODEL = Deno.env.get('AI_MODEL') ?? 'llama-3.3-70b-versatile';
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT') ?? 40);
const ANON_DAILY_LIMIT = Number(Deno.env.get('AI_ANON_DAILY_LIMIT') ?? 5);
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Resolves the Supabase user from the caller's JWT (null for anonymous visitors).
async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (!auth || !SUPABASE_URL) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: auth, apikey: SUPABASE_ANON_KEY } });
  if (!res.ok) return null;
  const u = await res.json();
  return u?.id ?? null;
}

// Best-effort in-memory quota (per isolate). Move to a DB table for durability across instances.
const usage = new Map<string, { day: string; count: number }>();
function overQuota(key: string, limit: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const u = usage.get(key);
  if (!u || u.day !== day) { usage.set(key, { day, count: 1 }); return false; }
  u.count += 1;
  return u.count > limit;
}

const UPDATE_QUESTION_TOOL = {
  type: 'function',
  function: {
    name: 'update_question',
    description: 'Update a specific survey question in the research draft.',
    parameters: {
      type: 'object',
      properties: {
        index: { type: 'number', description: 'The 0-based index of the question to update.' },
        questionText: { type: 'string', description: 'The new text for the question.' },
        type: { type: 'string', enum: ['multiple_choice', 'short_answer', 'rating'] },
        options: { type: 'array', items: { type: 'string' }, description: 'Options for multiple choice questions.' },
        rationale: { type: 'string', description: 'Updated scientific rationale for this question.' },
      },
      required: ['index'],
    },
  },
};

const systemForChat = (c: { topic: string; variables: string; demographics: string; questions: unknown[] }) => `
You are Dr. Unidata, a Senior Research Methodologist and expert in survey design, tailored to the Nigerian academic and market research landscape.

CONTEXT OF THE STUDY:
- Topic: ${c.topic}
- Core Variables: ${c.variables}
- Target Demographics: ${c.demographics}
- Current Instrument Draft: ${JSON.stringify(c.questions)}

YOUR MANDATE:
1. COLLABORATIVE EDITOR: When the user asks for changes, USE the 'update_question' tool to apply them. If they say "make Q1 more professional", rewrite it and call the tool (Q1 = index 0).
2. METHODOLOGICAL ADVISOR: If a user asks for a leading question, explain why it introduces bias and suggest a neutral alternative.
3. BEST PRACTICES: prefer Likert scales for attitudes; avoid double-barreled questions; keep language accessible but academic.
4. NIGERIAN CONTEXT: consider mobile-first users, data costs, and cultural sensitivities.
5. Keep replies concise. Your goal is a bulletproof Chapter 3 (Methodology).
`;

async function complete(body: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: MODEL, temperature: 0.4, ...body }),
  });
  if (!res.ok) throw new Error(`Provider error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (await res.json()).choices[0].message;
}

async function jsonTask(system: string, user: string) {
  const msg = await complete({
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  return JSON.parse(msg.content);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!API_KEY) return json({ error: 'AI is not configured on the server.' }, 500);

  const userId = await getUserId(req);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anon';
  if (userId ? overQuota(`u:${userId}`, DAILY_LIMIT) : overQuota(`ip:${ip}`, ANON_DAILY_LIMIT)) return json({ error: 'Daily AI limit reached. Try again tomorrow.' }, 429);

  try {
    const { task, payload } = await req.json();
    const clip = (s: unknown, n = 4000) => String(s ?? '').slice(0, n);

    switch (task) {
      case 'analyze-context': {
        const out = await jsonTask(
          'Expert academic consultant for Nigeria. Reply with JSON only: {"variables": string, "demographics": string}.',
          `Review this research description: "${clip(payload.text)}". Suggest 3-5 variables and the target demographics.`,
        );
        return json({ variables: String(out.variables ?? ''), demographics: String(out.demographics ?? '') });
      }
      case 'generate-questions': {
        const out = await jsonTask(
          'You are a survey design expert. Ensure high academic quality and clarity. Reply with JSON only: {"questions":[{"question":string,"type":"multiple_choice"|"short_answer"|"rating","options":string[] (required for multiple_choice),"rationale":string}]}.',
          `Draft 4 high-quality survey questions for: "${clip(payload.topic, 500)}". Variables: ${clip(payload.keywords, 500)}. Audience: ${clip(payload.demographics, 500)}. Formats: ${(payload.preferredTypes ?? []).join(',')}.${payload.proposalText ? ` Proposal excerpt: ${clip(payload.proposalText, 3000)}` : ''}`,
        );
        return json({ questions: Array.isArray(out.questions) ? out.questions : [] });
      }
      case 'audit-bias': {
        const out = await jsonTask(
          'Critical Research Auditor focused on neutrality and clarity. Reply with JSON only: {"score": number 0-100, "findings": string[], "suggestions": string[]}.',
          `Audit these questions for bias: ${clip(JSON.stringify(payload.questions), 8000)}`,
        );
        return json({ score: Number(out.score) || 0, findings: out.findings ?? [], suggestions: out.suggestions ?? [] });
      }
      case 'chat': {
        const history = Array.isArray(payload.messages) ? payload.messages.slice(-20) : [];
        const msg = await complete({
          tools: [UPDATE_QUESTION_TOOL],
          messages: [{ role: 'system', content: systemForChat(payload.context) }, ...history],
        });
        const toolCalls = (msg.tool_calls ?? []).flatMap((tc: any) => {
          try { return [{ name: tc.function.name, args: JSON.parse(tc.function.arguments) }]; } catch { return []; }
        });
        return json({ text: msg.content ?? '', toolCalls });
      }
      default:
        return json({ error: 'Unknown task' }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: 'AI request failed.' }, 502);
  }
});
