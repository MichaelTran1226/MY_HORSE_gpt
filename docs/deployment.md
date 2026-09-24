# Deployment: Render + Supabase

Status (2026-09-24): deployed to https://horse-training.onrender.com using Render service **Horse-Training**, the `MY_HORSE_gpt` repository's `main` branch, Docker, and Supabase PostgreSQL. No custom domain or verified email sender has been configured.

## 1. Supabase

Create a new dedicated EquiFlow project. Keep the database password private. In **Connect**, choose the PostgreSQL **Session pooler** connection string (port 5432), suitable for persistent servers on IPv4. Replace the password placeholder and URL-encode any special characters. Append `?sslmode=require&connection_limit=5` when no query string exists.

Use this server-side connection as `DATABASE_URL`. Never put it in a frontend VITE variable. No Supabase anon/service API key is needed: Prisma connects directly to PostgreSQL. The migrations enable RLS on application tables to prevent unintended exposure through Supabase's public data API.

References: https://supabase.com/docs/guides/database/connecting-to-postgres and https://supabase.com/docs/guides/database/postgres/row-level-security

## 2. Render

Connect the Git repository and choose a **Web Service**, Docker runtime, with repository root as the build context. The checked-in `render.yaml` is also available for Blueprint setup. Select a plan in your own account; the supplied Blueprint requests free compute, with the platform's free-service limitations.

Set these environment variables in Render's dashboard:

The ignored local `backend/.env.cloud` file is only a private input for deployment setup. Git push does **not** upload its values to Render. Set the variables on the service itself, then deploy again. Never commit the file or copy it into the Docker image.

- `DATABASE_URL`: the private Supabase session-pooler connection.
- `APP_ORIGIN`: the exact HTTPS Render service origin, no trailing slash.
- `NODE_ENV=production`
- `TRUST_PROXY=1`
- `EMAIL_API_KEY` and `EMAIL_FROM`: leave blank until a verified Resend sender is available.

Build runs the Dockerfile. Startup applies versioned migrations before launching the server. The same service serves React and /api, keeping session cookies on one origin. Health check: `/api/status`. Do not expose PostgreSQL directly to the browser.

References: https://render.com/docs/docker and https://render.com/docs/blueprint-spec

## 3. First manager

The local manager is not automatically copied to the cloud. Bootstrap once against the new cloud database from a private local environment or a service shell:

```powershell
cd backend
# Configure DATABASE_URL privately for the destination first.
$env:BOOTSTRAP_EMAIL='datthanh4177@gmail.com'
$env:BOOTSTRAP_NAME='Club Manager'
npm run bootstrap:manager
```

If BOOTSTRAP_PASSWORD is omitted, a random password is written to `backend/.manager-credentials.local.txt`, never printed or committed. A manager must not already exist. Keep this file private. Existing local credentials must be moved to a safe location before generating a separate cloud credentials file; do not overwrite them.

Managers can create real staff/owner accounts. No sample horses or staff are seeded.

The cloud manager was created on 2026-09-24. Its separate password is in ignored `backend/.manager-credentials.cloud.txt`; the local manager password remains in `.manager-credentials.local.txt`.

## 4. Email verification

Public owner registration requires an email provider. Current integration uses Resend: configure a verified sender/domain and its API key in server environment variables. No fixed development code or email bypass exists. With delivery unconfigured, registration reports an explicit service-unavailable error; manager-created accounts still work.

The user currently has no domain. Email sender configuration and a successful delivery test remain open release work. Do not claim owner self-registration is operational until delivery is tested.

Reference: https://resend.com/docs/send-with-nodejs

## 5. Verify before sharing

- Open /api/status and confirm status ok.
- Sign in as the manager and confirm an HttpOnly, Secure, SameSite=Lax cookie.
- Refresh a deep link such as /app?page=Horse%20registry.
- Create staff, register/admit an actual horse, schedule training, record a veterinary lock, verify training is blocked, record follow-up and release.
- Check owner isolation using two owners.
- Confirm real OTP delivery and expired/incorrect code handling.
- Repeat mobile/browser checks against the actual HTTPS URL.
- Review service logs without logging credentials or medical payloads.

## Backups and rollback

Take a database backup before migrations on an existing project. The initial migration targets a fresh database; do not run it against unrelated tables. Restore a tested database backup for schema rollback; never run prisma migrate reset against a live service. Roll back the web service to the previous successful image only when its database schema remains compatible.

## Operational limits

This is a single-instance course-project deployment. Authentication rate limiting is process-local; multi-instance deployment requires a shared limiter. Free compute may sleep. Cloud database reachability and HTTPS cookie behavior were verified on 2026-09-24; email delivery, backups/restore and live performance targets remain unverified. Optional stable-care/racing/finance UI is not completed in this core build.

## Deployment failures resolved

- **Horse-Training / Prisma P1012:** Docker built successfully, but startup failed because Render had no `DATABASE_URL`. Configured the cloud database URL with TLS and a five-connection limit, `APP_ORIGIN`, `NODE_ENV`, `TRUST_PROXY`, and `/api/status` health check, then redeployed successfully.
- **Racehorse / missing requirements.txt:** the older service points to a different repository and uses Python. It is not the active EquiFlow deployment and was left unchanged. Use **Horse-Training** for this project's deployments.
