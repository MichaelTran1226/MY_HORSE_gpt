import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { roles, readUser } from "../roles";
import "../workspace.css";
import { apiClient } from "@/shared/lib/api";
import { HorseWorkspace } from "@/features/workspace/HorseWorkspace";
import { AdminWorkspace } from "@/features/workspace/AdminWorkspace";
import { TrainingCalendar } from "@/features/workspace/TrainingCalendar";
import { StallWorkspace } from "@/features/workspace/StallWorkspace";
import { CareDue } from "@/features/workspace/CareDue";

import { WorkspaceOverview } from "@/features/workspace/WorkspaceOverview";
const unavailable = new Set([
  "Financial reports",
  "Supplies catalog",
  "Stable supplies",
  "Meal rations",
  "Daily care",
  "Incident reports",
  "Race registration",
  "Club reports",
]);
export function ActorDashboardPage() {
  const user = readUser();
  const [params] = useSearchParams();
  const [menu, setMenu] = useState(false);
  const [logout, setLogout] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const notify = () => {
      setSaved(true);
      clearTimeout(timer);
      timer = setTimeout(() => setSaved(false), 4500);
    };
    window.addEventListener("equiflow:records-changed", notify);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("equiflow:records-changed", notify);
    };
  }, []);
  if (!user) return <Navigate to="/login" replace />;
  const role = roles[user.role];
  const page = params.get("page");
  const feature = role.features.find((f) => f[0] === page);
  if (page && !feature) return <Navigate to="/forbidden-403" replace />;
  return (
    <div className="workspace">
      <aside className={menu ? "workspace-nav open" : "workspace-nav"}>
        <Link className="workspace-brand" to="/app">
          <img src="/images/logo-fivegates.svg" alt="" />
          EquiFlow<span>HORSE CLUB</span>
        </Link>
        <div className="role-badge">
          <ShieldCheck size={18} />
          <div>
            {role.name}
            <small>Personal workspace</small>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Workspace navigation">
          <Link
            className={!page ? "selected" : ""}
            to="/app"
            onClick={() => setMenu(false)}
          >
            <LayoutDashboard size={18} />
            Overview
          </Link>
          {role.features.map(([name], i) => (
            <Link
              className={page === name ? "selected" : ""}
              key={name}
              to={"/app?page=" + encodeURIComponent(name)}
              onClick={() => setMenu(false)}
            >
              <span className="nav-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              {name}
              {unavailable.has(name) && (
                <span className="feature-availability">Planned</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="nav-bottom">
          <small>EquiFlow / Club workspace</small>
          <button onClick={() => setLogout(true)}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-top">
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <span>
            Workspace <ChevronRight size={14} />{" "}
            {feature ? feature[0] : "Overview"}
          </span>
          <div className="user-chip">
            <span>
              {role.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              {role.name}
              <small>{user.email}</small>
            </div>
          </div>
        </header>
        <main className="workspace-content">
          {saved && (
            <div className="save-notice" role="status">
              Changes saved successfully.
            </div>
          )}
          <p className="workspace-eyebrow">
            {role.name.toUpperCase()} WORKSPACE
          </p>
          <h1>{feature ? feature[0] : role.title}</h1>
          <p className="workspace-description">
            {feature ? feature[1] : role.description}
          </p>
          {!feature ? (
            <>
              <WorkspaceOverview />
              <div className="section-heading">
                <h2>Your workspace</h2>
                <span>{role.features.length} areas</span>
              </div>
              <div className="feature-grid">
                {role.features.map(([name, description], i) => (
                  <Link
                    key={name}
                    to={"/app?page=" + encodeURIComponent(name)}
                    className={
                      "feature-card" +
                      (unavailable.has(name) ? " unavailable" : "")
                    }
                  >
                    <div>
                      <span className="feature-index">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <ArrowUpRight size={20} />
                    </div>
                    <h3>{name}</h3>
                    <p>{description}</p>
                    <span className="feature-action">
                      {unavailable.has(name)
                        ? "Planned extension"
                        : "Open workspace"}{" "}
                      <ChevronRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : ["Training calendar", "Training assignments"].includes(
              feature[0],
            ) ? (
            <TrainingCalendar />
          ) : feature[0] === "Training overview" ? (
            <TrainingCalendar overview />
          ) : feature[0] === "Stall map" ? (
            <StallWorkspace />
          ) : feature[0] === "Staff accounts" ? (
            <AdminWorkspace key="accounts" />
          ) : feature[0] === "Audit Log" ? (
            <AdminWorkspace audit key="audit" />
          ) : feature[0] === "Access permissions" ? (
            <section className="record-panel">
              <h2>Server-enforced role permissions</h2>
              {Object.values(roles).map((r) => (
                <div key={r.name}>
                  <h3>{r.name}</h3>
                  <p>{r.features.map((f) => f[0]).join(" · ")}</p>
                </div>
              ))}
            </section>
          ) : unavailable.has(feature[0]) ? (
            <section className="record-panel">
              <h2>Optional extension</h2>
              <p>
                This area belongs to the optional stable-care or racing/finance
                scope. It is not enabled in the core release.
              </p>
            </section>
          ) : (
            <>
              {["VETERINARIAN", "CLUB_MANAGER", "HORSE_OWNER"].includes(
                user.role,
              ) && <CareDue />}
              <HorseWorkspace area={feature[0]} />
            </>
          )}
          <footer className="workspace-footer">
            EquiFlow · Horse Training & Racing Club{" "}
            <span>Connected workspace</span>
          </footer>
        </main>
      </div>
      {logout && (
        <div className="dialog-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="logout-dialog"
          >
            <h2 id="logout-title">Sign out of EquiFlow?</h2>
            <p>Your current session will be closed.</p>
            <div>
              <button autoFocus onClick={() => setLogout(false)}>
                Stay signed in
              </button>
              <button
                onClick={async () => {
                  try {
                    await apiClient("/auth/logout", {
                      method: "POST",
                      body: "{}",
                    });
                    localStorage.removeItem("equiflow:user");
                    window.location.assign("/login");
                  } catch {
                    window.alert("Sign out failed. Please retry.");
                  }
                }}
              >
                Sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
