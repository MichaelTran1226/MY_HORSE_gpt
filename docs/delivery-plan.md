# EquiFlow delivery plan

Source of truth: `subject.md`; retain the existing React, NestJS and PostgreSQL architecture. The user requested completion through deployment. Render and Supabase are now connected.

## Acceptance and execution order

1. Identity: persistent users, email verification, server sessions, five roles, owner isolation, manager-controlled staff accounts. No fixed credentials or OTP in production.
2. Horse profiles: create/update, search, ownership, intake and stable assignment; owners see only their horses.
3. Training: plans, dated assignments, trial metrics and trainer assessment. Veterinary locks must block scheduling and execution, including concurrent requests.
4. Health: medical history, injuries, health status, preventive care and training lock/release. Audit sensitive changes.
5. Role dashboards: connect real records, handle loading/empty/error states, responsive forms and navigation. Preserve existing visual identity.
6. Optional flows: stable routines/nutrition/incidents/supplies and racing/results/financial statements remain separately tracked; do not represent placeholders as complete.
7. Release: reproducible database migrations, environment configuration, production build, automated checks, hosting instructions and live smoke checks after accounts are connected.

## Verification

- Baseline and final: `npm --prefix backend run build`, `npm --prefix frontend run build`, `npm --prefix frontend run lint`.
- Add backend automated authorization, validation, persistence and training-lock tests; test API negative paths and concurrent mutations against disposable PostgreSQL.
- Check actual browser flows for each role on desktop/mobile.
- Never add fabricated club records. Test fixtures belong only in disposable test databases.
- A successful build does not establish working database, browser or production behavior.

## Deployment inputs

Render Horse-Training and Supabase PostgreSQL are connected. Email delivery still requires a verified provider/sender. Google OAuth is a proposed integration, not implemented.

## Open requirements and evidence

- User approved an interactive 2D injury map instead of the subject's 3D model (2026-09-24).
- Baseline issues resolved: fixed demo credentials/OTP, nonpersistent registration and unguarded horse/health controllers. See validation.md for current evidence and remaining deployment inputs.
- Core UI now connects to PostgreSQL-backed workflows. Optional stable-care, inventory, racing and finance interfaces remain unavailable.
- Timing targets in PRD remain targets until measured on the deployed application.

## Boundaries

Keep `subject.md` unchanged. Preserve user files. Do not publish secrets, send external messages, create paid services or claim deployment without observed evidence. Required schema, application, test and deployment configuration changes are authorized by the end-to-end build request.

## Sample data and desktop UX (2026-09-24)

User authorized labeled sample business records and six role accounts, an English desktop dashboard using database values, and a complete Vietnamese README. The explicit sample seed is idempotent and preserves existing data. Credentials remain in ignored local files. Mobile redesign is outside this increment. README contains 15 demonstration scenarios; it does not claim 15 optional modules are implemented.
