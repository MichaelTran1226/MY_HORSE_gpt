# Five-actor authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and demo local FE/BE authentication for the five subject.md actors, with Gmail-labelled registration, fixed local OTP `123456`, and 15-minute OTP semantics.

**Architecture:** Extend the existing NestJS auth module with role-aware email/password endpoints and a dev-only OTP adapter. Extend the existing React/Vite auth route with shared forms and actor-specific base dashboards. Google OAuth is documented only and deliberately not implemented in this phase.

**Tech Stack:** React + Vite + TypeScript, NestJS + TypeScript, existing Prisma schema, CSS tokens, Vitest/Jest where already configured.

**Spec:** `docs/superpowers/specs/2026-09-23-auth-five-actors-design.md`

## Global Constraints

- Actor names and labels must follow `subject.md` exactly: Head Trainer, Veterinarian, Groom / Stable Hand, Horse Owner, Club Manager.
- Google OAuth is deferred; only the future integration is documented.
- OTP validity is fifteen minutes; raw OTP values are never persisted or logged.
- Local demo OTP is exactly `123456` and must be visibly marked development-only.
- No fabricated business records; only auth/session demo state may be created locally.
- Real Google/Gmail delivery is not claimed until credentials and provider configuration are supplied and tested.
- Forms must have visible labels, inline errors, keyboard focus, loading feedback, and mobile-safe touch targets.

## Review Focus

- Unknown or unsupported actor: reject registration/login instead of silently defaulting to a role. Test in backend auth validation task.
- Expired, reused, malformed, and over-attempted OTP: reject with generic safe feedback. Test in OTP service task.
- Gmail-labelled registration must not imply Google OAuth is active. Test in FE copy/configuration task.
- Missing Google/SMTP env values on localhost: keep the app runnable because they are not needed in this phase. Test in documentation task.
- Narrow mobile viewport: auth form and actor cards must not overflow horizontally and must retain visible focus. Test in FE task.

### Task 1: Establish auth contracts and local demo accounts

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/modules/auth/auth.service.ts`
- Modify: `backend/src/modules/auth/auth.controller.ts`
- Modify: `backend/src/modules/auth/auth.module.ts`
- Create: `backend/src/modules/auth/auth.types.ts`
- Create: `backend/src/modules/auth/auth.service.spec.ts`
- Create: `backend/prisma/seed.ts`

**Interfaces:**
- Produces `ActorRole`, `RegisterAuthDto`, `LoginAuthDto`, `RequestOtpDto`, and `VerifyOtpDto` used by controller and FE.

- [ ] **Step 1: Write failing tests for exact role labels, unsupported-role rejection, and five demo accounts.**
- [ ] **Step 2: Run the focused backend test and confirm failure.**
- [ ] **Step 3: Add the five-role enum/types and validation without changing unrelated modules.**
- [ ] **Step 4: Run the focused test and confirm it passes.**
- [ ] **Step 5: Commit `feat: align auth actors and local demo accounts`.**

### Task 2: Implement password auth and 15-minute OTP

**Files:**
- Modify: `backend/src/modules/auth/auth.service.ts`
- Modify: `backend/src/modules/auth/auth.controller.ts`
- Modify: `backend/src/modules/auth/auth.module.ts`
- Create: `backend/src/modules/auth/otp.store.ts`
- Create: `backend/src/modules/auth/otp.store.spec.ts`
- Modify: `backend/.env.example`

**Interfaces:**
- Produces `POST /auth/register`, `POST /auth/login`, `POST /auth/otp/request`, and `POST /auth/otp/verify`.
- `OtpStore.issue(email): { expiresAt }`, `OtpStore.verify(email, code): boolean`.

- [ ] **Step 1: Write failing tests for issue, verify, expiry, single-use, resend invalidation, and attempt limit.**
- [ ] **Step 2: Run tests and confirm they fail.**
- [ ] **Step 3: Implement development OTP storage with a 15-minute expiry and fixed code `123456`; label it as local-only and never send it to production logs.**
- [ ] **Step 4: Implement password registration/login and generic invalid-credential errors.**
- [ ] **Step 5: Run focused backend tests and typecheck.**
- [ ] **Step 6: Commit `feat: add local password and otp auth`.**

### Task 3: Build FE auth shell and actor dashboards

**Files:**
- Modify: `frontend/src/features/auth/pages/LoginPage.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/shared/lib/api.ts`
- Create: `frontend/src/features/auth/pages/RegisterPage.tsx`
- Create: `frontend/src/features/auth/pages/OtpPage.tsx`
- Create: `frontend/src/features/auth/pages/ActorDashboardPage.tsx`
- Modify: `frontend/src/shared/lib/messages.ts`
- Modify: `frontend/src/shared/components/layout/AppShell.tsx`
- Modify: `frontend/public/styles/global.css`

**Interfaces:**
- Produces the FE auth routes and five actor base dashboards.

- [ ] **Step 1: Write focused UI tests or type-level route checks for all five actor labels, Gmail-labelled registration, and fixed OTP copy.**
- [ ] **Step 2: Run the focused FE test/check and confirm failure.**
- [ ] **Step 3: Implement shared auth shell, visible labels, inline errors, loading states, OTP countdown, and responsive styling.**
- [ ] **Step 4: Implement five minimal actor dashboards using exact subject.md names.**
- [ ] **Step 5: Run FE lint/typecheck/build and inspect desktop/mobile routes.**
- [ ] **Step 6: Commit `feat: add local five actor auth screens`.**

### Task 4: Document demo and defer Google integration

**Files:**
- Modify: `README.md`
- Create: `docs/auth-localhost.md`

**Interfaces:**
- FE calls the password/OTP endpoints; successful auth routes to `/app/:actor`.

- [ ] **Step 1: Document local commands, fixed OTP `123456`, demo accounts, and a clearly marked future Google OAuth note for Horse Owner.**
- [ ] **Step 2: Run backend build/tests and frontend build.**
- [ ] **Step 3: Start local FE/BE and manually verify register/login/OTP for all five actors.**
- [ ] **Step 4: Verify no horizontal overflow at desktop and 390px viewport.**
- [ ] **Step 5: Commit `docs: document local auth demo and verification`.**
