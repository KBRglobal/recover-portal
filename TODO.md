# Recover-Portal — Desktop Claim Workspace · TODO

Source of truth: HANDOFF-CLAIM-WORKSPACE.md. API contract verified against
`/Users/claude/Documents/mykeyz/backend/src/routes/depositRecovery.ts` (read 2026-06-16).
Brand: align to `index.html` light system (navy #0A2540 + fog + real SVG icons, Inter, mono). NO emoji.

## Phase 1 — Polish connect.html (premium, on-brand)
- [x] connect.html — re-skin from dark (#0B1430/gold) to light index.html system (white bg, navy, brass accent)
- [x] connect.html — replace text brand with the search-key SVG logo + "Deposit Recovery" wordmark
- [x] connect.html — real SVG icons only (lock/shield/check), remove the ✓ glyph text node
- [x] connect.html — keep the X25519/AES handshake JS byte-for-byte (verified working — do not touch crypto)
- [x] connect.html — on auth success: store mk_web_token, show success state, redirect to workspace.html

## Phase 2 — workspace.html (the claim workspace)
- [x] workspace.html — boot: read sessionStorage['mk_web_token']; missing/401 → redirect to connect.html
- [x] workspace.html — header: logo + "Private session · signed in as <name>" chip (GET /auth/me)
- [x] workspace.html — fetch GET /deposit-recovery → branch empty vs has-cases
- [x] workspace.html — empty: hero + 3 pricing tiers (GET /deposit-recovery/pricing) → POST /deposit-recovery {tier}
- [x] workspace.html — has-cases: list case cards (stage label, status chip, amounts, readiness score)
- [x] workspace.html — case detail: stage + status, RDC fee estimate, deposit/withheld amounts
- [x] workspace.html — readiness: score meter + checklist (present/missing, required), toggle via POST /:id/documents {docType}
- [x] workspace.html — payment: POST /:id/checkout {tier} → redirect to checkoutUrl (Stripe); upgrades show delta
- [x] workspace.html — paid: show paid state; POST /:id/pack → downloadUrl; GET /:id/pack fresh link; "emailed you a link"
- [x] workspace.html — stage actions: notice-sent / filed / resolve (POST /:id/<transition>)
- [x] workspace.html — Stripe return handling (?case=<id>) → open case + poll status until paidAt
- [x] workspace.html — global 401 handler → clear token + back to connect.html

## Phase 3 — Verify
- [x] Serve on :8102, load connect.html + workspace.html + case-detail headless (chrome CDP) → 0 console errors on all 3; QR renders against live API; mocked token+fetch render full case UI
- [ ] Manual (Moshe): scan from phone → connect → workspace renders his real case (only step needing a real account)

## Phase 4 — Deploy (DONE — Moshe lifted the gate)
- [x] git repo KBRglobal/recover-portal (Moshe created) — init + pushed main
- [x] server.js (zero-dep static) + package.json so Railway can serve it
- [x] Railway service `recover-portal` in project mykeyz-api, auto-deploys on push → LIVE recover-portal-production.up.railway.app (verified 200 + /health ok)
- [x] API CORS: added railway + pages origins to ALLOWED_ORIGINS (api service) — verified live ACAO
- [x] headless E2E on live Railway portal: QR renders, reaches API, 0 console errors
- [x] (also on Cloudflare Pages mykeyz-recover.pages.dev — redundant; retire once Railway confirmed)

## Phase 5 — Custom domain (.org — system, NOT .io)
- [ ] Register mykeyz.org (AVAILABLE) — Moshe's purchase (can't buy via tools)
- [ ] Add custom domain on Railway recover-portal service → CNAME in .org zone → add origin to API CORS
- [ ] Update connect.html LINK_ORIGIN to the final .org host
</content>
</invoke>
