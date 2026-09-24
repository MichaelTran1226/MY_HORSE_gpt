# Local authentication

The old fixed-password / fixed-OTP demo has been replaced with database-backed authentication.

Follow [the current README](../README.md) for startup. The local manager email is `datthanh4177@gmail.com`; its generated password is stored privately in `backend/.manager-credentials.local.txt` and is ignored by Git.

- Sessions use an HttpOnly cookie and are revoked on sign-out.
- Public registration is Horse Owner only and requires actual email verification.
- Staff and managed owner accounts are created by the Club Manager.
- Email verification integration needs EMAIL_API_KEY and EMAIL_FROM. It has not been delivery-tested without provider credentials.
- No fixed OTP and no published demo credentials are accepted.
- Google OAuth is not implemented.
