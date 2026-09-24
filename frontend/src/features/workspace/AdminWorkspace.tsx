import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api";
import { Field, MutationForm } from "./forms";
import type { Account } from "./records";
import "./workspace-data.css";
export function AdminWorkspace({ audit = false }: { audit?: boolean }) {
  const [accounts, setAccounts] = useState<Account[]>([]),
    [logs, setLogs] = useState<
      {
        id: string;
        timestamp: string;
        action: string;
        entityType: string;
        user?: Account;
      }[]
    >([]);
  const [revision, setRevision] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = () => {
    setLoading(true);
    setError("");
    setRevision((v) => v + 1);
  };
  useEffect(() => {
    let active = true;
    (audit
      ? apiClient<typeof logs>("/accounts/audit").then((v) => {
          if (active) setLogs(v);
        })
      : apiClient<Account[]>("/accounts").then((v) => {
          if (active) setAccounts(v);
        })
    )
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [audit, revision]);
  return (
    <section className="record-panel">
      <button onClick={refresh}>Refresh</button>
      {loading ? (
        <p role="status">Loading records…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : audit ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>{l.user?.fullName || "System"}</td>
                  <td>{l.action}</td>
                  <td>{l.entityType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <p>No recorded activity.</p>}
        </div>
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.fullName}</td>
                    <td>{a.email}</td>
                    <td>{a.role}</td>
                    <td>
                      {a.isLocked
                        ? "Locked"
                        : a.emailVerified
                          ? "Verified"
                          : "Unverified"}
                    </td>
                    <td>
                      <button
                        onClick={async () => {
                          try {
                            await apiClient("/accounts/" + a.id, {
                              method: "PATCH",
                              body: JSON.stringify({ isLocked: !a.isLocked }),
                            });
                            refresh();
                          } catch (e) {
                            setError(
                              e instanceof Error
                                ? e.message
                                : "Unable to change account",
                            );
                          }
                        }}
                      >
                        {a.isLocked ? "Unlock" : "Lock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <details>
            <summary>Create staff / owner account</summary>
            <MutationForm endpoint="/accounts" onSaved={refresh}>
              <Field name="fullName" label="Full name" />
              <Field name="email" label="Email" type="email" />
              <Field
                name="password"
                label="Initial password (10–72 characters)"
                type="password"
                maxLength={72}
              />
              <Field name="role" label="Role">
                {[
                  "HEAD_TRAINER",
                  "VETERINARIAN",
                  "GROOM",
                  "HORSE_OWNER",
                  "CLUB_MANAGER",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Field>
            </MutationForm>
          </details>
        </>
      )}
    </section>
  );
}
