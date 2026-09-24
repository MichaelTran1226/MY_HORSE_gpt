import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { type Role } from "../roles";
import "../workspace.css";
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiClient<{
        user: { id: string; email: string; fullName: string; role: Role };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, pass: password }),
      });
      localStorage.setItem("equiflow:user", JSON.stringify(result.user));
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your club workspace."
      footer={
        <span>
          New to the club? <Link to="/register">Create an owner account</Link>
        </span>
      }
    >
      <form className="auth-form" onSubmit={submit}>
        {error && (
          <p role="alert" className="auth-alert">
            <AlertCircle size={18} />
            {error}
          </p>
        )}
        <label>
          Email address
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <div className="password-field">
            <input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in to workspace"}{" "}
          <ArrowRight size={18} />
        </button>
      </form>
      <p>
        <Link to="/verify-otp">Verify your email or resend a code</Link>
      </p>
    </AuthShell>
  );
}
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="auth-page refined-auth">
      <section className="auth-card">
        <Link className="auth-brand" to="/login">
          <img src="/images/logo-fivegates.svg" alt="EquiFlow" />{" "}
          <span>
            EquiFlow<small>HORSE TRAINING & RACING CLUB</small>
          </span>
        </Link>
        <div className="auth-inner">
          <p className="eyebrow">CLUB WORKSPACE</p>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          <div className="auth-footer">{footer}</div>
        </div>
        <p className="auth-bottom">
          One workspace. Five roles. A shared standard of care.
        </p>
      </section>
      <section className="auth-art">
        <div>
          <p className="eyebrow">EQUIFLOW / CONNECTED CARE</p>
          <h2>
            One team.
            <br />
            One shared goal.
          </h2>
          <p>
            From the first morning feed to the finish line.
            <br />
            Keep every part of your club in step.
          </p>
        </div>
      </section>
    </main>
  );
}
