# AI proxy (Edge Function)

The browser never holds an AI key. `aiService.ts` calls `supabase/functions/ai`, which talks to any
OpenAI-compatible provider (default: Groq free tier).

```bash
supabase secrets set AI_API_KEY=<provider key>
# optional:
supabase secrets set AI_BASE_URL=https://api.groq.com/openai/v1 AI_MODEL=llama-3.3-70b-versatile AI_DAILY_LIMIT=40
supabase functions deploy ai
```

Swap provider by changing the three secrets (e.g. OpenRouter: `https://openrouter.ai/api/v1`).
The daily quota is in-memory per instance and keyed by IP - replace with a per-user table once Supabase Auth lands (backlog #2).
