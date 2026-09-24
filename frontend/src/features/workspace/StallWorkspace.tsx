import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api";
import { readUser } from "../auth/roles";
import { Field, MutationForm } from "./forms";
export function StallWorkspace() {
  const [stalls, setStalls] = useState<
      {
        id: string;
        stallNumber: string;
        barnSection: string;
        horse?: { name: string; healthStatus: string };
      }[]
    >([]),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    apiClient<typeof stalls>("/stables/stalls")
      .then((v) => {
        if (active) setStalls(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const refresh = () => {
    setLoading(true);
    setError("");
    setRevision((v) => v + 1);
  };
  return (
    <section className="record-panel">
      <h2>Stall allocation</h2>
      <button onClick={refresh}>Refresh</button>
      {loading ? (
        <p role="status">Loading stalls…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : stalls.length ? (
        <div className="record-grid">
          {stalls.map((s) => (
            <article className="record-stat" key={s.id}>
              <h3>
                {s.barnSection} · {s.stallNumber}
              </h3>
              <p>{s.horse?.name || "Vacant"}</p>
              {s.horse && (
                <span className={"status " + s.horse.healthStatus}>
                  {s.horse.healthStatus}
                </span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>No stalls have been entered.</p>
      )}
      {readUser()?.role === "CLUB_MANAGER" && (
        <details>
          <summary>Add stall</summary>
          <MutationForm endpoint="/stables/stalls" onSaved={refresh}>
            <Field name="barnSection" label="Barn / section" />
            <Field name="stallNumber" label="Stall number" />
          </MutationForm>
        </details>
      )}
    </section>
  );
}
