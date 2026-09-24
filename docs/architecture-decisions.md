# Delivery decisions (2026-09-24)

This document records changes from the earlier architecture/PRD where implementation choices changed during the authorized delivery.

- Keep React/Vite, NestJS and Prisma/PostgreSQL. Upgrade NestJS 10 to patched NestJS 11 and bcrypt 6 to remove the audited vulnerable dependency tree.
- Use opaque, random 256-bit session tokens in HttpOnly cookies. Store only their SHA-256 digests in PostgreSQL. This replaces the old fallback-secret JWT demo and makes logout/account locking immediately enforceable.
- Keep frontend and API on one origin in deployment. Validate mutation origins and require a custom header, with SameSite cookies.
- Use row locks on the horse record for veterinary restrictions, scheduling and execution. This serializes competing operations. A veterinary lock cancels unfinished sessions; release does not revive them.
- Use a user-approved schematic 2D injury map instead of the original 3D requirement.
- Use Render Docker hosting and Supabase PostgreSQL as the prepared target. Nothing has yet been provisioned in the user's accounts.
- Deny public Data API access to application tables with PostgreSQL RLS; Prisma uses the private server database connection.
- Use Resend integration for email verification; sender/domain and live delivery remain unconfigured.
- Keep optional stable-care, inventory, racing and financial extensions visibly unavailable. Required core flows and their supporting account/stall management are the implemented scope.
