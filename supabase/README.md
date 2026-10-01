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
Quotas: signed-in users get `AI_DAILY_LIMIT` (40) requests/day, anonymous visitors `AI_ANON_DAILY_LIMIT` (5) by IP. They are in-memory per instance, so they reset on redeploy - move to a table if abuse appears.

# Auth & database setup

1. **Email OTP:** in Supabase -> Authentication -> Email Templates -> "Magic Link", include `{{ .Token }}` in the body (the app asks users to type the 6-digit code). Also add the same to "Confirm signup".
2. **SMTP:** Supabase's built-in email is limited to a handful of emails per hour. Configure a custom SMTP provider (Resend, Brevo or similar free tier) under Authentication -> SMTP before launch.
3. **Apply the migration:** `supabase db push` (or paste `migrations/20260930000000_auth_and_rls.sql` in the SQL editor). It enables Row Level Security, adds the `admins` table and the `matched_campaigns()` function.
4. **Make yourself admin:** `insert into public.admins (email) values ('you@example.com');`
5. Rotate the anon key that was committed earlier (Project Settings -> API) and put the new one in `.env.local` as `VITE_SUPABASE_ANON_KEY`.

# Survey sharing & responses

Apply `migrations/20261001000000_survey_sharing_and_responses.sql` after the auth migration. It adds `share_slug`/`status`/`response_limit` to `campaigns`, a `responses` table (RLS: only the campaign's researcher can read), and two public RPCs: `get_public_survey(slug)` and `submit_response(slug, token, answers)`. Respondents open `#/s/<slug>`, no login required; duplicates are blocked per signed-in user or per browser token (a soft limit - the token can be cleared).
