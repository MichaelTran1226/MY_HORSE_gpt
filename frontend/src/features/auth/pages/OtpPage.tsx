import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "./LoginPage";
import { apiClient } from "@/shared/lib/api";
export function OtpPage() {
  const [email, setEmail] = useState(
    sessionStorage.getItem("equiflow:verification-email") || "",
  );
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await apiClient("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      setVerified(true);
      sessionStorage.removeItem("equiflow:verification-email");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    setBusy(true);
    try {
      const result = await apiClient<{ message: string }>("/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(result.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      title={verified ? "Email verified." : "Check your inbox."}
      subtitle="Verification codes expire after five minutes."
      footer={<Link to="/login">Back to sign in</Link>}
    >
      {verified ? (
        <p>
          You can now <Link to="/login">sign in</Link>.
        </p>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Verification code
            <input
              required
              pattern="[0-9]{6}"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          {message && <p role="status">{message}</p>}
          <button disabled={busy}>Verify email</button>
          <button type="button" disabled={busy || !email} onClick={resend}>
            Resend code
          </button>
        </form>
      )}
    </AuthShell>
  );
}
