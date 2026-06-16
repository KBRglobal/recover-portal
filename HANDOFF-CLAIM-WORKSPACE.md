# Recover-Portal — Desktop Claim Workspace (HANDOFF for a separate session)

> This is a NON-app task. The MyKeyz mobile-app session is handling app bugs.
> Run this in its own session. Everything needed is below — self-contained.

## What already works (verified E2E 2026-06-16)
The WalletConnect-style phone→desktop handoff is BUILT and CONFIRMED working:
- `connect.html` (this folder): generates an X25519 keypair → `POST /web-link/start`
  → renders a QR (`https://recover.mykeyz.io/link/<sessionId>`) → polls
  `GET /web-link/:id/poll` → on `authorized`, decrypts the sealed token in-browser
  (X25519 ECDH → HKDF-SHA256 salt=sessionId info=`mykeyz-web-link-v1` → AES-256-GCM)
  and stores it: `sessionStorage['mk_web_token']`.
- The phone app (Settings → "Connect to computer", testmode ≥ 00115) scans the QR and
  POSTs `/web-link/:id/authorize`. Confirmed: desktop shows "Connected securely · Signed
  in as <email>". So the private, session-bound, ephemeral auth is DONE.
- `qrcode.min.js` is vendored locally (davidshimjs/qrcodejs) — no CDN/SRI dependency.

## The job (two parts)
1. **Improve the visuals** of `connect.html` (it's a functional dark page now — make it
   premium, on-brand; `hero.png` is in this folder). NO emoji — real icons only.
2. **Build the private claim workspace** that opens AFTER "Connected securely", using
   `sessionStorage['mk_web_token']` as `Authorization: Bearer <token>` for every API call.
   This is the actual deposit-recovery product on a real computer (folders/files), the
   reason for the desktop handoff (nobody files a claim from a phone).

## Environment / constraints
- API base: `https://api.mykeyz.io/v1` (live). CORS already allows `https://recover.mykeyz.io`
  and `http://localhost:8102`. **Serve locally on port 8102** (e.g.
  `python3 -m http.server 8102 --directory <this folder>`), else CORS blocks.
- Stack: plain static HTML/JS (no framework). Keep it that way unless there's a strong reason.
- This folder is NOT a git repo yet. `git init` + a remote, then deploy to Railway →
  `recover.mykeyz.io` (project `mykeyz-recover`). Not deployed yet — local only for now.
- Auth: ALL workspace calls use the `mk_web_token` Bearer. The token is short-lived; if a
  call 401s, send the user back to the QR connect screen to re-link.

## Backend deposit-recovery API (all `/v1`, Bearer except where noted)
- `GET /deposit-recovery/pricing` (public) → `{ tiers: [...], rdc info, checklist, disclaimers }`.
  Tiers: `landlord_notice` 249 AED · `claim_pack` 499 AED · `lawyer_filing` 999 AED.
- `POST /deposit-recovery` → create a case `{ tier }`.
- `GET /deposit-recovery` → list the user's cases.
- `GET /deposit-recovery/:id` → one case (status: draft → awaiting_landlord → ...).
- `POST /deposit-recovery/:id/documents` → attach documents to the case.
- `POST /deposit-recovery/:id/checkout` → Stripe Checkout session (web pays, 0% Apple).
- `POST /deposit-recovery/:id/confirm-payment` → reconcile after return from Stripe.
- `GET /deposit-recovery/:id/pack` / `POST .../pack` → the assembled claim pack.
- `GET /deposit-recovery/download/:token` (public, tokenized) → secure ZIP download.
- Stripe webhook (server-side, raw-body sig): `/webhooks/stripe/deposit-recovery` → builds
  ZIP → emails a secure download link (data-export model). Migrations 0065/0066/0067.

## Reference docs (read first)
- `backend/docs/rdc-filing-requirements.md` — Dubai RDC filing requirements (grounding).
- `docs/specs/rdc-claim-guide-research.md` — claim flow research; web is the INVERSE of the
  public verify portal.
- `docs/specs/RESUME.md` lines ~90–91, 116 — deposit-recovery state + web-link summary.
  (All paths relative to the mykeyz app repo at `/Users/claude/Documents/mykeyz`.)

## Legal / voice rules (STRICT — match the app)
- Framing: **document preparation, NOT legal representation**. The `lawyer_filing` (999) is a
  SEPARATE lawyer track — do NOT say "we are not a law firm".
- We only TELL the user the RDC fee (`estimateRdcFeeAed`); the client pays the RDC directly.
- Voice: calm, premium, neutral, trust (Apple/Stripe register). No fear/aggression, no
  "fight your landlord". No crypto-jargon to users (no blockchain/SHA-256/cryptographic).
- NO emoji anywhere — real icons only.

## Suggested build order
1. Polish `connect.html` visuals (premium, on-brand).
2. After "Connected": fetch `/deposit-recovery` (Bearer). Empty → "Start a claim" (show
   `/deposit-recovery/pricing` tiers). Existing → list cases → open one.
3. Case workspace: status, attach documents, pick tier, checkout (Stripe), show pack /
   secure download. Re-link on 401.
4. `git init` + deploy to Railway (recover.mykeyz.io) when visuals are ready.
