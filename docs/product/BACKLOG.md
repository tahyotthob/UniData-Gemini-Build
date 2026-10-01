# Backlog (MoSCoW, draft)

## Must (Phase 0–2: make it safe, then close the loop)
1. **Move AI server-side, remove Gemini** — Edge Function proxy, free-tier open model, per-user quota. *AC:* no AI key in browser bundle; all 4 AI features + chat work; quota enforced.
2. **Real auth (Supabase Auth) + RLS — DONE in code; migration + Supabase dashboard setup pending (see supabase/README.md)** — *AC:* users can't read others' data; admin role gated.
3. **Publish survey → shareable link/QR — DONE in code (needs migration 20261001)** — *AC:* researcher gets a public URL; works on mobile/low data.
4. **Collect responses — DONE in code (needs migration 20261001)** — respondent answers stored, one per respondent, progress/validation. *AC:* researcher sees count live.
5. **Consent + privacy policy** for demographics (NDPA) — consent checkbox added at signup; privacy policy page still to write.
6. **Campus respondent pool** — opt-in profiles feed the existing matching engine (moved to SQL).

## Should
7. Results dashboard with charts + CSV export (free: basic; paid: full analysis).
8. Paystack checkout for paid extras (₦2k–5k/project).
9. Advanced AI methodology (bias audit, sample-size calculator, Cronbach's alpha) as paid extra.
10. Browser-native voice (STT/TTS) replacing Gemini Live.

## Could
11. SPSS/Excel export, reminders, boost to campus WhatsApp groups, respondent airtime rewards.

## Won't (for now)
Paid respondent panel, institution accounts, multi-campus expansion.

## Launch plan
Pilot at owner's university → 10 friendly researchers → free until response loop is reliable → turn on Paystack for paid extras.
