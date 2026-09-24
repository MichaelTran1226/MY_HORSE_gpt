# EquiFlow

Horse-club web application based on [subject.md](subject.md). React + NestJS 11 + Prisma/PostgreSQL. The user approved a 2D injury map in place of the subject's 3D model.

## Local use

Requires Node.js 22+ and PostgreSQL. This workspace has a dedicated PostgreSQL container named `equiflow-dev-postgres` on `127.0.0.1:55439`; its configuration is stored in ignored `backend/.env`.

```powershell
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod
```

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173/login**. Initial local manager: `datthanh4177@gmail.com`. Its generated password is in the ignored local file `backend/.manager-credentials.local.txt`. The previous demo accounts and OTP 123456 are no longer valid.

For a fresh database, configure `backend/.env` from its example and run `npm run bootstrap:manager` with BOOTSTRAP_EMAIL set. No sample business records are seeded.

## Implemented core

- Persistent accounts, HttpOnly sessions, server-side role checks, owner isolation, account locking, real email OTP integration.
- Horse registration/intake, manager admission, ownership and stall assignment.
- Training plans, day/week schedules, staff assignment, trial-run metrics, assessments and fitness charts.
- Medical records, schematic 2D injury marking, preventive care reminders and completion.
- Veterinary training locks cancel unfinished sessions and block scheduling/execution. Unlock requires a follow-up medical record.
- Staff management and audit history.

Optional nutrition, care-task, inventory, racing and financial-report screens are not enabled. Basic stall allocation is available to support intake.

## Verify

```powershell
npm --prefix backend run build
npm --prefix backend test
npm --prefix frontend run build
npm --prefix frontend run lint
```

Integration tests require an isolated PostgreSQL database with a name ending in `_test`; they reset test records. Set DATABASE_URL to that database, apply migrations and run `npm run test:integration` in backend. Then run `npx playwright test` in frontend. Set TEST_DATABASE_URL for CI or nonstandard local test connections. Browser tests depend on the integration fixtures and use the same isolated test database.

CI executes the complete sequence. Test fixtures are explicitly marked and never go into the application database.

## Deployment and remaining setup

See [deployment instructions](docs/deployment.md) and [delivery status](docs/validation.md). Docker serves frontend and API on one origin. Render/Supabase accounts and email sender configuration must be connected before a live release can be verified.

Owner self-registration will report email unavailable until EMAIL_API_KEY and EMAIL_FROM are configured. Manager-created accounts can sign in without external email delivery.
