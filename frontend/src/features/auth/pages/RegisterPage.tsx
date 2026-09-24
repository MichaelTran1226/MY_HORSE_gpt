import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "./LoginPage";
import { apiClient } from "@/shared/lib/api";
export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", fullName: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      sessionStorage.setItem("equiflow:verification-email", form.email);
      navigate("/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      title="Join your horse club."
      subtitle="Create your Horse Owner account."
      footer={<Link to="/login">Already registered? Sign in</Link>}
    >
      <form onSubmit={submit} className="auth-form">
        <label>
          Full name
          <input
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            minLength={10}
            maxLength={72}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <p>
          Use at least 10 characters. Staff accounts are created by the club
          manager.
        </p>
        {error && (
          <p role="alert">
            {error} <Link to="/verify-otp">Request a verification code</Link>
          </p>
        )}
        <button disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
