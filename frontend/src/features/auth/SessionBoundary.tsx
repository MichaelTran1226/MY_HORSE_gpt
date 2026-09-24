import { useEffect, useState, type ReactNode } from "react";
import { apiClient } from "@/shared/lib/api";
import { Link } from "react-router-dom";
export function SessionBoundary({ children }: { children: ReactNode }) {
  const [state, setState] = useState("loading"),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const expired = () => {
      localStorage.removeItem("equiflow:user");
      window.location.assign("/login");
    };
    window.addEventListener("equiflow:session-expired", expired);
    apiClient("/auth/me")
      .then((user) => {
        if (active) {
          localStorage.setItem("equiflow:user", JSON.stringify(user));
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
      window.removeEventListener("equiflow:session-expired", expired);
    };
  }, [attempt]);
  if (state === "loading")
    return (
      <main className="record-panel">
        <p role="status">Checking your session…</p>
      </main>
    );
  if (state === "error")
    return (
      <main className="record-panel">
        <p role="alert">Unable to load your session.</p>
        <button
          onClick={() => {
            setState("loading");
            setAttempt((v) => v + 1);
          }}
        >
          Retry
        </button>{" "}
        <Link to="/login">Sign in</Link>
      </main>
    );
  return children;
}
