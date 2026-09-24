# Validation and remaining work

Verified on the current local implementation. This is not a claim of live deployment.

| Check | Observed result |
| --- | --- |
| Backend build | Passed (NestJS 11, TypeScript) |
| Frontend production build | Passed; final JS approximately 368.49 kB / 115.17 kB gzip |
| Frontend lint | Passed |
| Security unit tests | 2 passed |
| PostgreSQL/API integration tests | 10 passed |
| Browser end-to-end tests | 5 passed |
| Dependency audit | Zero reported vulnerabilities in current backend/frontend dependency installs |
| Docker build | Passed, image `equiflow:local` |
| Container health check | HTTP 200, database reachable |
| SPA deep-link routing in container | HTTP 200 HTML |
| Anonymous protected API call | HTTP 401 |
| Container login / logout | HTTP 201 / HTTP 201 |
| Production cookie attributes | HttpOnly, Secure, SameSite=Lax observed |
| Container privilege / secrets | UID 1000; local .env and manager credentials absent |
| Git diff whitespace check | Passed |
| Main application data | 1 manager account, 0 horses; no invented business records |

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

## Not verified / not complete

- Render service and Supabase project have not been connected or deployed. No public URL is available.
- Actual email delivery requires EMAIL_API_KEY and a verified EMAIL_FROM. OTP validation is tested, provider delivery is not.
- HTTPS browser behavior at the eventual public hostname, cloud migration connectivity, live performance targets, backups/restore and remote CI have not been verified.
- Optional nutrition/daily-care/inventory/racing/financial-report interfaces are not implemented. Their navigation explains that they are unavailable; racing APIs are not registered in the running app.
- The initial schema assumes a fresh EquiFlow database. Migrating an unrelated/existing database requires a separate compatibility review.
- Automated coverage is focused on core workflows, not every possible field combination, browser or accessibility criterion.

## Next deployment input

The user is creating Render and Supabase accounts and has no email domain yet. Private placeholders are prepared in ignored `backend/.env.cloud`:
- DATABASE_URL: Supabase session-pooler connection.
- RENDER_API_KEY: Render API credential if automated deployment is desired.
- APP_ORIGIN: assigned after the public service URL exists.

Do not paste credentials into chat or Git. The local manager password is stored in ignored `backend/.manager-credentials.local.txt`.

