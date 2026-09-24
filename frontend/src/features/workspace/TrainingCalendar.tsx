import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api";
import { date } from "./records";
type Entry = {
  id: string;
  sessionDate: string;
  isCompleted: boolean;
  cancelledAt?: string;
  rating?: number;
  plan: {
    title: string;
    intensity: string;
    horse: { name: string; isTrainingLocked: boolean };
  };
};
type Overview = {
  id: string;
  name: string;
  healthStatus: string;
  trainingPlans: {
    sessions: {
      sessionDate: string;
      isCompleted: boolean;
      cancelledAt?: string;
      rating?: number;
    }[];
  }[];
};
export function TrainingCalendar({ overview = false }: { overview?: boolean }) {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10)),
    [days, setDays] = useState(7),
    [entries, setEntries] = useState<Entry[]>([]),
    [horses, setHorses] = useState<Overview[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + days);
    end.setUTCMilliseconds(-1);
    const request = overview
      ? apiClient<Overview[]>("/training/overview").then((v) => {
          if (active) setHorses(v);
        })
      : apiClient<Entry[]>("/training/calendar", {
          params: { from: start, to: end.toISOString() },
        }).then((v) => {
          if (active) setEntries(v);
        });
    request
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [start, days, overview]);
  return (
    <section className="record-panel">
      <h2>{overview ? "Training progress & fitness" : "Training schedule"}</h2>
      {!overview && (
        <div className="record-toolbar">
          <label>
            Starting date{" "}
            <input
              aria-label="Starting date"
              type="date"
              required
              value={start}
              onChange={(e) => {
                if (e.target.value) {
                  setLoading(true);
                  setError("");
                  setStart(e.target.value);
                }
              }}
            />
          </label>
          <select
            aria-label="Calendar view"
            value={days}
            onChange={(e) => {
              setLoading(true);
              setError("");
              setDays(Number(e.target.value));
            }}
          >
            <option value={1}>Day view</option>
            <option value={7}>Week view</option>
          </select>
        </div>
      )}
      {loading ? (
        <p role="status">Loading training data…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : overview ? (
        <div className="record-grid">
          {horses.map((h) => {
            const sessions = h.trainingPlans.flatMap((p) => p.sessions),
              ratings = sessions
                .filter((s) => s.rating)
                .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
                .slice(-10);
            return (
              <article className="record-stat" key={h.id}>
                <h3>{h.name}</h3>
                <p>
                  {h.healthStatus} ·{" "}
                  {sessions.filter((s) => s.isCompleted).length}/
                  {sessions.length} sessions complete
                </p>
                {ratings.length ? (
                  <>
                    <svg
                      viewBox="0 0 240 110"
                      role="img"
                      aria-label={h.name + " performance ratings from 1 to 10"}
                    >
                      <line
                        x1="10"
                        y1="100"
                        x2="230"
                        y2="100"
                        stroke="#a5b19b"
                      />
                      <polyline
                        points={ratings
                          .map(
                            (s, i) =>
                              10 +
                              (i * 220) / Math.max(1, ratings.length - 1) +
                              "," +
                              (100 - (s.rating || 0) * 9),
                          )
                          .join(" ")}
                        fill="none"
                        stroke="#315d45"
                        strokeWidth="3"
                      />
                      {ratings.map((s, i) => (
                        <circle
                          key={i}
                          cx={10 + (i * 220) / Math.max(1, ratings.length - 1)}
                          cy={100 - (s.rating || 0) * 9}
                          r="4"
                          fill="#315d45"
                        />
                      ))}
                    </svg>
                    <p>
                      {ratings
                        .map(
                          (s) => date(s.sessionDate) + ": " + s.rating + "/10",
                        )
                        .join(" · ")}
                    </p>
                  </>
                ) : (
                  <p>No assessments recorded.</p>
                )}
              </article>
            );
          })}
          {!horses.length && <p>No horse profiles yet.</p>}
        </div>
      ) : entries.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date / time</th>
                <th>Horse</th>
                <th>Plan</th>
                <th>Intensity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.sessionDate).toLocaleString()}</td>
                  <td>{s.plan.horse.name}</td>
                  <td>{s.plan.title}</td>
                  <td>{s.plan.intensity}</td>
                  <td>
                    {s.cancelledAt
                      ? "Cancelled"
                      : s.isCompleted
                        ? "Completed"
                        : s.plan.horse.isTrainingLocked
                          ? "Medically restricted"
                          : "Scheduled"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No sessions in this period.</p>
      )}
    </section>
  );
}
