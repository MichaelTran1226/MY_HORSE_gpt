# Validation and remaining work

Local verification and cloud verification are recorded separately below.

| Check | Observed result |
| --- | --- |
| Backend build | Passed (NestJS 11, TypeScript) |
| Frontend production build | Passed; final JS approximately 368.49 kB / 115.17 kB gzip |
| Frontend lint | Passed |
| Security unit tests | 2 passed |
| PostgreSQL/API integration tests | 10 passed |
| Browser end-to-end tests | 6 passed (including desktop dashboard counts and error retry) |
| Dependency audit | Zero reported vulnerabilities in current backend/frontend dependency installs |
| Docker build | Passed, image `equiflow:local` |
| Container health check | HTTP 200, database reachable |
| SPA deep-link routing in container | HTTP 200 HTML |
| Anonymous protected API call | HTTP 401 |
| Container login / logout | HTTP 201 / HTTP 201 |
| Production cookie attributes | HttpOnly, Secure, SameSite=Lax observed |
| Container privilege / secrets | UID 1000; local .env and manager credentials absent |
| Git diff whitespace check | Passed |
| Application data | Original manager preserved; user-authorized labeled sample dataset added on 2026-09-24 |

## Behavioral evidence

Integration tests exercise unauthorized access; owner-isolated lists and details; admission; invalid input; trainer permissions; plan/session/trial persistence; veterinary lock/cancellation/release and audit; concurrent scheduling and locking (six trials); preventive care; logout; OTP attempt tracking and one-use enforcement; calendar/overview owner isolation; manager-only stalls; and RLS on all 16 application tables.

Browser tests use a separate `equiflow_test` database:
1. All five actors sign in and sign out without observed page errors.
2. Manager creates an owner and a horse through forms.
3. Trainer creates a plan, assigns a session and records trial metrics.
4. Veterinarian clicks the 2D map, saves an injury and observes the training lock.
5. Owner view at 390 px stays within the viewport and excludes another owner's horse.

Screenshots in ignored `frontend/test-results/` contain clearly named test fixtures, not real club data.

## Problems found and resolved

- Fixed credentials authenticated without persisted users; removed.
- Horse lists were not owner-filtered; fixed and regression-tested.
- Form select labels did not work with exact label-based browser selectors; replaced with explicit label/control associations.
- Local PostgreSQL connections using localhost timed out while opening a second transaction against an IPv4-bound container. Switching to 127.0.0.1 resolved the failure; concurrency tests now pass.
- Old dependency tree contained high/critical advisories; updated the NestJS 11/bcrypt stack and removed unused authentication dependencies.
- Docker Engine was stopped during a later verification attempt; that run failed to reach PostgreSQL. After the user restarted it, the complete API/browser suite was rerun successfully.

## Cloud deployment verified (2026-09-24)

- Render service **Horse-Training**, https://horse-training.onrender.com, deployed commit `a3d99498b590d1280ec7febbe653e93d261f23b0`; deploy `dep-daq871gu01pc73f72v90` reached `live`.
- Initial startup failure was Prisma P1012, missing Render `DATABASE_URL`. The ignored local cloud file does not populate Render automatically. Configured service environment and database-backed `/api/status` health check; no application code change was needed.
- Supabase was empty before startup. Migrations created 16 application tables plus the migration table. Created the requested cloud manager without seeding business records.
- Public HTTPS `/api/status` returned 200 and `status: ok`.
- Actual Chromium manager login, authenticated page refresh, desktop logout and subsequent unauthorized `/api/auth/me` passed. Session cookie is HttpOnly, Secure and SameSite=Lax.
- At 390 px, the dashboard had no horizontal overflow; opening mobile navigation and signing out passed with zero page errors. The first automation attempt omitted opening the collapsed mobile navigation and timed out; rerun with the correct interaction passed.
- The unrelated older **Racehorse** service still has its original Python build failure and was not changed.

## Not verified / not complete

- Actual email delivery requires EMAIL_API_KEY and a verified EMAIL_FROM. OTP validation is tested, provider delivery is not.
- Live performance targets, backups/restore and remote CI have not been verified. Full business-workflow tests ran on the isolated local test database, not against production.
- Optional nutrition/daily-care/inventory/racing/financial-report interfaces are not implemented. Their navigation explains that they are unavailable; racing APIs are not registered in the running app.
- The initial schema assumes a fresh EquiFlow database. Migrating an unrelated/existing database requires a separate compatibility review.
- Automated coverage is focused on core workflows, not every possible field combination, browser or accessibility criterion.

## Private deployment configuration

Render and Supabase are connected. The user has no email domain yet. Private configuration is stored in ignored `backend/.env.cloud`:
- DATABASE_URL: Supabase session-pooler connection.
- RENDER_API_KEY: Render API credential if automated deployment is desired.
- APP_ORIGIN: https://horse-training.onrender.com.

Do not paste credentials into chat or Git. The local manager password is stored in ignored `backend/.manager-credentials.local.txt`; the separate cloud manager password is in ignored `backend/.manager-credentials.cloud.txt`.


## Sample dataset and desktop dashboard verification (2026-09-24)

- Explicit sample seed completed against local and cloud databases. Cloud repeat run reported already seeded and preserved existing records.
- All six cloud sample accounts authenticated successfully through the actual API. Each sample owner received exactly its three horses; staff received all six.
- Backend/frontend builds and frontend lint passed. Backend unit/integration: 12 passed. Browser suite: 6 passed, including real dashboard/database count comparison and a simulated API failure followed by successful retry. The existing mobile regression test was retained; no mobile redesign was requested.
- Local desktop screenshot inspected at 1440 px. Initial sample metrics: 6 horses, 2 training restrictions, 3 active sessions in the next 7 days, 1 pending admission.
- README rewritten with setup, architecture, role guide, deployment, private account file locations, 15 sample scenarios, exceptions and honest limits. Google OAuth remains a documented proposal and requires Google/Supabase provider configuration plus application integration.
