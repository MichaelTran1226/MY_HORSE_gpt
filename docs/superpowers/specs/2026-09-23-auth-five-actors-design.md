# Five-actor authentication design

## Goal

Deliver a working local FE/BE authentication demo for EquiPro with separate base destinations for five actors, email/password login and registration labelled as Gmail registration, and a six-digit OTP flow with a 15-minute validity window.

## Scope

Actors follow `subject.md`: `HEAD_TRAINER` (Head Trainer), `VETERINARIAN` (Veterinarian), `GROOM_STABLE_HAND` (Groom / Stable Hand), `HORSE_OWNER` (Horse Owner), and `CLUB_MANAGER` (Club Manager). The UI uses one shared auth shell with actor-aware copy and routes successful sessions to a minimal actor dashboard. The backend owns validation, password hashing, OTP expiry, session/token issuance, and role checks.

Google OAuth is explicitly deferred. The current local registration keeps the Gmail wording in the UI but does not contact Google; the local OTP is always `123456` for demo verification. A later increment may add Google OAuth for `HORSE_OWNER` only.

## Data flow

1. FE submits login or registration to the NestJS auth API.
2. BE validates input and role, hashes passwords, and persists only account/auth data.
3. For OTP, BE stores a hash of the code and an expiry timestamp fifteen minutes in the future. The raw code is never logged or persisted.
4. FE shows the OTP screen with a server-derived expiry/countdown and supports resend with rate limits.
5. Successful verification issues the existing project session/token format and routes to the actor dashboard.
6. Google OAuth uses a server callback and the Google verified email/profile; no client-side trust of an arbitrary email is allowed.

## External configuration

No Google or SMTP credential is required for the current local demo. The fixed OTP `123456` must be clearly marked as development-only. Real Gmail delivery and Google OAuth remain future configuration work; secrets must remain local and never be committed.

## Error and security behavior

- Invalid credentials return a generic authentication error.
- OTP verification rejects expired, already-used, malformed, or over-attempted codes.
- Resend is rate limited and invalidates the prior code.
- Passwords and OTP values are never returned to the client.
- Role-specific route guards prevent a valid user from entering another actor's dashboard.
- Forms have visible labels, inline errors, keyboard focus, loading feedback, and mobile-safe touch targets.

## Verification

Run FE and BE typecheck/build commands. Exercise registration, login, OTP success, OTP expiry, invalid OTP, Google configuration fallback, and all five successful actor destinations. Verify desktop and narrow mobile layouts without horizontal overflow.

## Explicit non-goals

No detailed actor business workflows, no fabricated business records, no production Google/Gmail secrets, and no claim that real Gmail delivery works until credentials and provider configuration are supplied and tested.
