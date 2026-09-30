# Unidata — Project Review & Improvement Plan

## What the project is today
A Vite + React 19 + Tailwind (CDN) single-page MVP: landing page, waitlist, AI survey drafting
("Dr. Unidata" chat + voice), respondent/researcher profiles and a basic survey-matching engine.
Backend is Supabase (`profiles`, `campaigns`). All AI goes through Gemini, called **directly from the browser**.

## Critical issues (fix first)
1. **API key exposed to every visitor.** `vite.config.ts` injects `GEMINI_API_KEY` into the client bundle, so anyone can extract and abuse it. Any LLM provider has the same problem if called from the browser → move AI calls to a server (Supabase Edge Function / Vercel function).
2. **Supabase URL + anon key hard-coded** in `supabaseClient.ts`. The anon key is designed to be public, but only if **Row Level Security** is enabled on every table. Verify RLS; remove the fallbacks and use `VITE_` env vars.
3. **No real authentication.** `AuthContext` stores the profile in `localStorage` — anyone can impersonate a user or set `role: 'researcher'`. Use Supabase Auth (email OTP / magic link / Google) and key profiles by `auth.uid()`.
4. **Admin dashboard has no access control** and `fetchAllProfiles` reads every user's PII (email, name, state, gender, age). Gate behind an admin role + RLS. Note: this data is covered by the Nigeria Data Protection Act (NDPA 2023) — you need consent capture, privacy policy, and a retention policy.
5. **Matching engine filters client-side** after downloading *all* campaigns; `camp.target_states.length` throws if a column is null. Move to a SQL query/RPC.
6. **Errors swallowed** (`catch → return empty`), so failures look like "no results". Surface errors to the UI.

## Code quality
- Flat layout (`App.tsx`, services in root) → move to `src/` with `src/lib`, `src/services`, `src/components`.
- Tailwind via CDN + `esm.sh` importmap duplicates `package.json` and skips the build pipeline. Install Tailwind properly and delete the importmap.
- No tests, linter, CI, or `tsconfig` strictness check; `any` casts in `apiService.ts`/`ResearchChat.tsx`.
- `ResearchChat.tsx` (330 lines) mixes audio plumbing, AI session and UI → split into a `useVoiceSession` hook + presentational component. `ScriptProcessorNode` is deprecated → `AudioWorklet`.
- AI JSON is `JSON.parse`d unvalidated → validate with `zod`.
- `README.md` is the AI Studio boilerplate; `metadata.json` is AI-Studio specific.
- Prompt strings embed user input raw (prompt-injection surface); `proposalText` is accepted but never used in `generateSurveyQuestions`.

## Product gaps (MVP → real product)
Survey *delivery and response collection* don't exist yet (no respondent answer storage, results/analytics, export to SPSS/CSV/Excel), nor rewards/payout (Paystack/Flutterwave), respondent verification/fraud control, or institution/supervisor workflows. The Chapter-3 methodology output is the strongest differentiator — lean into it (Likert validity, sample-size calculator, Cronbach's alpha, ethics-form generator).

## Removing the Gemini dependency
Gemini is used in 5 places: 4 text functions + chat with tool-calling in `geminiService.ts`, and **realtime voice** (`ai.live.connect`, `gemini-2.5-flash-native-audio`) in `ResearchChat.tsx`. Also `@google/genai` in `package.json`, the importmap in `index.html`, `GEMINI_API_KEY` in `vite.config.ts` and the README.

### Recommended architecture
```
Browser ──► /api/ai/* (Supabase Edge Function)  ──► LLM provider
              • auth check (Supabase JWT)           • Claude (Anthropic) / OpenAI / open model
              • rate limit + usage logging          • key lives only in server env
```
Put a small provider-agnostic interface (`LLMProvider { generateJSON, chat(tools) }`) behind the function so you can swap vendors via one env var.

### Step-by-step
1. Create `supabase/functions/ai/` with endpoints: `analyze-context`, `generate-questions`, `audit-bias`, `chat` (streaming).
2. Port `geminiService.ts` → `src/services/aiService.ts` that only `fetch`es those endpoints (no SDK in the browser).
3. Map features: structured JSON → tool-use / JSON-schema outputs; `update_question` function-call → the provider's tool-calling (works the same in Claude and OpenAI); chat history → kept client-side and sent each turn.
4. **Voice:** replace Live API with browser-native `SpeechRecognition` (STT) + `speechSynthesis` (TTS) feeding the same text chat — zero vendor cost and works with any LLM — or Whisper/Deepgram STT + any TTS later if quality in Nigerian accents matters. Nigerian-English accuracy should be tested before committing.
5. Delete `@google/genai`, the importmap entry, `process.env.*GEMINI*` defines, update README/`.env.example`.
6. Add cost controls: per-user daily quota table, caching of `analyze-context`, cheaper model for drafting and stronger model only for the bias audit.

Effort estimate: ~2–3 days for text features, +1–2 days for voice.

## Suggested roadmap
| Phase | Goal | Items |
|---|---|---|
| 0 (now) | Stop the bleeding | Move AI behind server, RLS audit, real auth, rotate exposed keys |
| 1 | Provider-agnostic AI | Steps above, tests for prompts/schemas |
| 2 | Core loop | Publish survey → respondent answers → results dashboard → CSV export |
| 3 | Monetisation | Paystack payments, respondent rewards, pricing tiers |
| 4 | Trust | NDPA compliance, respondent verification, institution partnerships |

> **Action required from you:** the Supabase anon key and (if ever deployed) the Gemini key are in public history — rotate both.
