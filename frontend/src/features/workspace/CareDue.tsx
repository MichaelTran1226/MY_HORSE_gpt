import { useState, useEffect } from "react";
import { apiClient } from "@/shared/lib/api";
export function CareDue() {
  const [items, setItems] = useState<
      {
        id: string;
        careType: string;
        scheduledDate: string;
        horse: { name: string };
      }[]
    >([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  function refresh() {
    setLoading(true);
    setError("");
    setRevision((value) => value + 1);
  }
  useEffect(() => {
    let active = true;
    apiClient<typeof items>("/health/due")
      .then((v) => {
        if (active) setItems(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    window.addEventListener("equiflow:records-changed", refresh);
    return () => {
      active = false;
      window.removeEventListener("equiflow:records-changed", refresh);
    };
  }, [revision]);
  return (
    <section className="record-panel">
      <h2>Care reminders · next 7 days & overdue</h2>
      {loading ? (
        <p role="status">Loading care reminders…</p>
      ) : error ? (
        <>
          <p role="alert">{error}</p>
          <button onClick={refresh}>Retry reminders</button>
        </>
      ) : items.length ? (
        items.map((i) => (
          <p key={i.id}>
            {i.horse.name} · {i.careType} ·{" "}
            {new Date(i.scheduledDate).toLocaleDateString()}
          </p>
        ))
      ) : (
        <p>No upcoming care reminders.</p>
      )}
    </section>
  );
}
