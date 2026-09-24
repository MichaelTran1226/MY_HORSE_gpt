import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { readUser } from "../auth/roles";
import type { Horse } from "./records";
import "./overview.css";

type Scheduled = {
  id: string;
  sessionDate: string;
  isCompleted: boolean;
  cancelledAt?: string;
  plan: { title: string; horse: { name: string } };
};
type Care = {
  id: string;
  careType: string;
  scheduledDate: string;
  horse: { name: string };
};
const healthLabels: Record<string, string> = {
  FIT: "Fit",
  WATCH: "Under observation",
  INJURED: "Injured",
  QUARANTINE: "Quarantined",
};
const pageLink = (name: string) => "/app?page=" + encodeURIComponent(name);

export function WorkspaceOverview() {
  const user = readUser()!;
  const [data, setData] = useState<{
    horses: Horse[];
    sessions: Scheduled[];
    care: Care[];
    updated: Date;
  } | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const canSeeCare = ["VETERINARIAN", "CLUB_MANAGER", "HORSE_OWNER"].includes(
    user.role,
  );
  useEffect(() => {
    let active = true;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    Promise.all([
      apiClient<Horse[]>("/horses"),
      apiClient<Scheduled[]>("/training/calendar", {
        params: { from: start.toISOString(), to: end.toISOString() },
      }),
      canSeeCare
        ? apiClient<Care[]>("/health/due")
        : Promise.resolve([] as Care[]),
    ])
      .then(([horses, sessions, care]) => {
        if (active) setData({ horses, sessions, care, updated: new Date() });
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [revision, canSeeCare]);
  const refresh = () => {
    setData(null);
    setError("");
    setRevision((v) => v + 1);
  };
  if (error)
    return (
      <section className="record-panel">
        <p role="alert">{error}</p>
        <button onClick={refresh}>Retry dashboard</button>
      </section>
    );
  if (!data)
    return (
      <section className="record-panel" aria-busy="true">
        <p role="status">Loading your workspace data…</p>
      </section>
    );
  const { horses, sessions, care } = data;
  const upcoming = sessions.filter((s) => !s.isCompleted && !s.cancelledAt);
  const registry =
    user.role === "CLUB_MANAGER"
      ? "Horse registry"
      : user.role === "HORSE_OWNER"
        ? "My Horses"
        : user.role === "VETERINARIAN"
          ? "Herd health"
          : user.role === "GROOM"
            ? "Stall map"
            : "Training Plans";
  const calendar =
    user.role === "GROOM"
      ? "Training assignments"
      : user.role === "HEAD_TRAINER"
        ? "Training calendar"
        : registry;
  const pending = horses.filter((h) => h.intakeStatus === "PENDING").length;
  const locked = horses.filter((h) => h.isTrainingLocked).length;
  const sampleCount = horses.filter((h) =>
    h.chipId.startsWith("SAMPLE-"),
  ).length;
  const metrics = [
    {
      title: user.role === "HORSE_OWNER" ? "My horses" : "Horses in view",
      value: horses.length,
      detail: `${horses.filter((h) => h.intakeStatus === "ADMITTED").length} admitted to the club`,
      icon: Activity,
    },
    {
      title: "Training restrictions",
      value: locked,
      detail: "Require veterinary follow-up",
      icon: ShieldAlert,
    },
    {
      title: "Scheduled this week",
      value: upcoming.length,
      detail:
        user.role === "GROOM"
          ? "Assigned to you · next 7 days"
          : "Active sessions · next 7 days",
      icon: CalendarDays,
    },
    {
      title: "Pending admission",
      value: pending,
      detail: "Awaiting a manager decision",
      icon: ArrowUpRight,
    },
  ];
  return (
    <div className="overview-data">
      <div className="overview-heading">
        <div>
          <span className="live-indicator">Database snapshot</span>
          <p>
            Updated{" "}
            {data.updated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ·{" "}
            {user.role === "HORSE_OWNER"
              ? "Your horses only"
              : "Your permitted workspace"}
          </p>
        </div>
        <button className="overview-refresh" onClick={refresh}>
          <RefreshCw size={15} /> Refresh data
        </button>
      </div>
      {sampleCount > 0 && (
        <p className="sample-notice">
          Sample data is included: {sampleCount} labeled horse profiles. All
          totals below are calculated from saved records.
        </p>
      )}
      <div className="overview-metrics">
        {metrics.map((m) => (
          <article className="metric-card" key={m.title}>
            <div>
              <span>{m.title}</span>
              <m.icon size={19} />
            </div>
            <strong>{m.value}</strong>
            <p>{m.detail}</p>
          </article>
        ))}
      </div>
      <div className="overview-columns">
        <section className="overview-panel">
          <div className="panel-title">
            <h2>Herd health</h2>
            <Link to={pageLink(registry)}>
              View records <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="panel-caption">
            Current health status of horses visible to you.
          </p>
          {Object.entries(healthLabels).map(([key, label]) => {
            const count = horses.filter((h) => h.healthStatus === key).length;
            return (
              <div className="health-breakdown" key={key}>
                <div>
                  <span>
                    <i className={"health-dot " + key} />
                    {label}
                  </span>
                  <b>{count}</b>
                </div>
                <progress
                  aria-label={label}
                  value={count}
                  max={Math.max(1, horses.length)}
                />
              </div>
            );
          })}
          {!horses.length && (
            <p className="panel-caption">
              No horse profiles yet. Add or request admission to get started.
            </p>
          )}
        </section>
        <section className="overview-panel">
          <div className="panel-title">
            <h2>Next training sessions</h2>
            <Link to={pageLink(calendar)}>
              Open workspace <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="panel-caption">
            Next 7 days · cancelled sessions excluded.
          </p>
          {upcoming.slice(0, 4).map((s) => (
            <article className="upcoming-row" key={s.id}>
              <time dateTime={s.sessionDate}>
                <b>{new Date(s.sessionDate).getDate()}</b>
                {new Date(s.sessionDate).toLocaleDateString("en", {
                  month: "short",
                })}
              </time>
              <div>
                <h3>{s.plan.horse.name}</h3>
                <p>{s.plan.title}</p>
              </div>
              <span>
                {new Date(s.sessionDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </article>
          ))}
          {!upcoming.length && (
            <div className="overview-empty">
              <CalendarDays size={28} />
              <h3>No upcoming sessions</h3>
              <p>New scheduled sessions will appear here.</p>
            </div>
          )}
        </section>
      </div>
      {canSeeCare && (
        <section className="overview-panel">
          <div className="panel-title">
            <h2>Care attention</h2>
            <span>{care.length} due or approaching</span>
          </div>
          <p className="panel-caption">
            Incomplete care through the next 7 days, including overdue items.
          </p>
          <div className="care-preview">
            {care.slice(0, 6).map((c) => (
              <article key={c.id}>
                <span className="care-type">
                  {c.careType.replaceAll("_", " ")}
                </span>
                <h3>{c.horse.name}</h3>
                <p>
                  {new Date(c.scheduledDate).toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </article>
            ))}
          </div>
          {!care.length && (
            <p className="panel-caption">No outstanding care in this window.</p>
          )}
        </section>
      )}
    </div>
  );
}
