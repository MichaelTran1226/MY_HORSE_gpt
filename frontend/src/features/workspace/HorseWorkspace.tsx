import { useEffect, useState } from "react";
import { apiClient } from "@/shared/lib/api";
import { readUser } from "../auth/roles";
import { Field, MutationForm, Action } from "./forms";
import { InjuryMap } from "./InjuryMap";
import { date, type Horse, type Account } from "./records";
import "./workspace-data.css";
function HorseFields({
  horse,
  owners,
  stalls,
}: {
  horse?: Horse;
  owners: Account[];
  stalls: { id: string; stallNumber: string }[];
}) {
  return (
    <>
      <Field name="name" label="Horse name" defaultValue={horse?.name} />
      <Field
        name="chipId"
        label="Chip / identification"
        defaultValue={horse?.chipId}
      />
      <Field name="breed" label="Breed" defaultValue={horse?.breed} />
      <Field
        name="dateOfBirth"
        label="Date of birth"
        type="date"
        defaultValue={horse?.dateOfBirth.slice(0, 10)}
      />
      <Field name="color" label="Coat color" defaultValue={horse?.color} />
      <Field name="gender" label="Sex" defaultValue={horse?.gender}>
        {["Stallion", "Mare", "Gelding"].map((v) => (
          <option key={v}>{v}</option>
        ))}
      </Field>
      <Field
        name="heightHands"
        label="Height (hands)"
        type="number"
        min={1}
        max={30}
        step="0.1"
        defaultValue={horse?.heightHands}
      />
      <Field
        name="weightKg"
        label="Weight (kg)"
        type="number"
        min={1}
        max={1500}
        step="0.1"
        defaultValue={horse?.weightKg}
      />
      <Field
        name="avatarUrl"
        label="Photo URL (HTTPS)"
        type="url"
        required={false}
        defaultValue={horse?.avatarUrl}
      />
      {readUser()?.role === "CLUB_MANAGER" && (
        <>
          <Field name="ownerId" label="Owner" defaultValue={horse?.ownerId}>
            <option value="">Select owner</option>
            {owners.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} — {u.email}
              </option>
            ))}
          </Field>
          <Field
            name="stallId"
            label="Stall"
            required={false}
            defaultValue={horse?.stallId}
          >
            <option value="">Unassigned</option>
            {stalls.map((s) => (
              <option key={s.id} value={s.id}>
                {s.stallNumber}
              </option>
            ))}
          </Field>
        </>
      )}
    </>
  );
}
export function HorseWorkspace({ area }: { area: string }) {
  const user = readUser()!;
  const manager = user.role === "CLUB_MANAGER",
    vet = user.role === "VETERINARIAN",
    trainer = user.role === "HEAD_TRAINER";
  const [horses, setHorses] = useState<Horse[]>([]),
    [horse, setHorse] = useState<Horse | null>(null),
    [accounts, setAccounts] = useState<Account[]>([]),
    [stalls, setStalls] = useState<{ id: string; stallNumber: string }[]>([]);
  const [selected, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  const refresh = () => {
    setLoading(true);
    setError("");
    setRevision((v) => v + 1);
  };
  const selectHorse = (id: string) => {
    setLoading(true);
    setError("");
    setHorse(null);
    setSelected(id);
  };
  useEffect(() => {
    let active = true;
    Promise.all([
      apiClient<Horse[]>("/horses"),
      selected
        ? apiClient<Horse>("/horses/" + selected)
        : Promise.resolve(null),
      manager
        ? apiClient<Account[]>("/accounts")
        : trainer
          ? apiClient<Account[]>("/accounts/staff")
          : Promise.resolve([]),
      manager
        ? apiClient<{ id: string; stallNumber: string }[]>("/stables/stalls")
        : Promise.resolve([]),
    ])
      .then(([list, detail, users, places]) => {
        if (active) {
          setHorses(list);
          setHorse(detail);
          setAccounts(users);
          setStalls(places);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selected, revision, manager, trainer]);
  if (loading)
    return (
      <section className="record-panel" aria-busy="true">
        <p role="status">Loading club records…</p>
      </section>
    );
  if (error)
    return (
      <section className="record-panel">
        <p role="alert">{error}</p>
        <button onClick={refresh}>Retry</button>
      </section>
    );
  const owners = accounts.filter((a) => a.role === "HORSE_OWNER");
  const visible = horses.filter(
    (h) =>
      (
        h.name +
        " " +
        h.chipId +
        " " +
        h.breed +
        " " +
        (h.stall?.stallNumber || "")
      )
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!status || h.healthStatus === status),
  );
  return (
    <div>
      <div className="record-toolbar">
        <input
          aria-label="Search horses"
          placeholder="Search name, chip, breed or stall…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Health filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All health states</option>
          {["FIT", "WATCH", "INJURED", "QUARANTINE"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button onClick={refresh}>Refresh</button>
        {selected && (
          <button onClick={() => selectHorse("")}>All horses</button>
        )}
      </div>
      {!horse ? (
        <>
          <section className="record-panel">
            <div className="record-grid">
              <div className="record-stat">
                <span>Horses in view</span>
                <strong>{horses.length}</strong>
              </div>
              <div className="record-stat">
                <span>Training restrictions</span>
                <strong>
                  {horses.filter((h) => h.isTrainingLocked).length}
                </strong>
              </div>
              <div className="record-stat">
                <span>Pending intake</span>
                <strong>
                  {horses.filter((h) => h.intakeStatus === "PENDING").length}
                </strong>
              </div>
            </div>
            {visible.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Horse / chip</th>
                      <th>Breed</th>
                      <th>Health</th>
                      <th>Admission</th>
                      <th>Stall</th>
                      <th>Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((h) => (
                      <tr key={h.id}>
                        <td>
                          {h.name}
                          <small> · {h.chipId}</small>
                        </td>
                        <td>{h.breed}</td>
                        <td>
                          <span className={"status " + h.healthStatus}>
                            {h.healthStatus}
                          </span>
                          {h.isTrainingLocked ? " · Locked" : ""}
                        </td>
                        <td>{h.intakeStatus}</td>
                        <td>{h.stall?.stallNumber || "Unassigned"}</td>
                        <td>
                          <button onClick={() => selectHorse(h.id)}>
                            Open {h.name}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-message">
                {horses.length
                  ? "No matching horses."
                  : "No horses yet. New profiles appear here when entered."}
              </p>
            )}
          </section>
          {(manager || user.role === "HORSE_OWNER") && (
            <section className="record-panel">
              <details>
                <summary>
                  {manager ? "Register a horse" : "Request horse admission"}
                </summary>
                <MutationForm endpoint="/horses" onSaved={refresh}>
                  <HorseFields owners={owners} stalls={stalls} />
                </MutationForm>
              </details>
            </section>
          )}
        </>
      ) : (
        <>
          <section className="record-panel">
            <h2>{horse.name}</h2>
            <p>
              {horse.chipId} · {horse.breed} · {horse.gender}
            </p>
            {horse.isTrainingLocked && (
              <p className="lock-warning" role="status">
                Training locked: {horse.lockReason}. Existing unfinished
                sessions are cancelled. Only a veterinarian can release the lock
                after a follow-up examination.
              </p>
            )}
            <div className="record-grid">
              <div className="record-stat">
                <span>Health</span>
                <strong>{horse.healthStatus}</strong>
              </div>
              <div className="record-stat">
                <span>Current weight</span>
                <strong>{horse.weightKg} kg</strong>
              </div>
              <div className="record-stat">
                <span>Height</span>
                <strong>{horse.heightHands} hands</strong>
              </div>
            </div>
            <p>
              Born {date(horse.dateOfBirth)} · Owner:{" "}
              {horse.owner?.fullName || "Unassigned"} · Stall:{" "}
              {horse.stall?.stallNumber || "Unassigned"} · {horse.intakeStatus}
            </p>
            {manager && (
              <>
                <details>
                  <summary>Edit profile</summary>
                  <MutationForm
                    endpoint={"/horses/" + horse.id}
                    method="PATCH"
                    onSaved={refresh}
                  >
                    <HorseFields
                      horse={horse}
                      owners={owners}
                      stalls={stalls}
                    />
                  </MutationForm>
                </details>
                {horse.intakeStatus === "PENDING" && (
                  <details>
                    <summary>Review admission</summary>
                    <MutationForm
                      endpoint={"/horses/" + horse.id + "/admission"}
                      onSaved={refresh}
                    >
                      <Field
                        name="ownerId"
                        label="Owner"
                        defaultValue={horse.ownerId}
                      >
                        {owners.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName}
                          </option>
                        ))}
                      </Field>
                      <Field
                        name="stallId"
                        label="Assign stall"
                        required={false}
                      >
                        <option value="">Unassigned</option>
                        {stalls.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.stallNumber}
                          </option>
                        ))}
                      </Field>
                      <Field name="intakeStatus" label="Decision">
                        <option value="ADMITTED">Admit</option>
                        <option value="REJECTED">Reject</option>
                      </Field>
                    </MutationForm>
                  </details>
                )}
              </>
            )}
          </section>
          <section className="record-panel">
            <h2>Training plans & performance</h2>
            {trainer && (
              <details>
                <summary>Create training plan</summary>
                {horse.isTrainingLocked ? (
                  <p className="lock-warning">
                    Scheduling is unavailable while this horse is locked.
                  </p>
                ) : (
                  <MutationForm
                    endpoint="/training/plans"
                    onSaved={refresh}
                    transform={(d) => ({ ...d, horseId: horse.id })}
                  >
                    <Field name="title" label="Plan title" />
                    <Field name="objective" label="Objective" type="textarea" />
                    <Field
                      name="distanceMeters"
                      label="Distance (m)"
                      type="number"
                      min={1}
                      max={100000}
                    />
                    <Field name="intensity" label="Intensity">
                      {["LIGHT", "MODERATE", "HEAVY"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </Field>
                    <Field name="surfaceType" label="Surface">
                      {["SAND", "GRASS", "SYNTHETIC"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </Field>
                    <Field
                      name="startDate"
                      label="Start"
                      type="datetime-local"
                    />
                    <Field name="endDate" label="End" type="datetime-local" />
                  </MutationForm>
                )}
              </details>
            )}
            {!horse.trainingPlans.length && <p>No training plans recorded.</p>}
            {horse.trainingPlans.map((plan) => (
              <details
                key={plan.id}
                open={area.includes("Training") || area.includes("Session")}
              >
                <summary>
                  {plan.title} · {plan.distanceMeters} m · {plan.intensity}
                </summary>
                <p>
                  {plan.objective} · {date(plan.startDate)} –{" "}
                  {date(plan.endDate)} · {plan.surfaceType}
                </p>
                {trainer && !horse.isTrainingLocked && (
                  <MutationForm
                    endpoint={"/training/plans/" + plan.id + "/sessions"}
                    onSaved={refresh}
                    label="Schedule session"
                  >
                    <Field
                      name="sessionDate"
                      label="Session date / time"
                      type="datetime-local"
                    />
                    <Field name="assignedToId" label="Assigned groom / trainer">
                      <option value="">Select staff</option>
                      {accounts
                        .filter((a) =>
                          ["GROOM", "HEAD_TRAINER"].includes(a.role),
                        )
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.fullName}
                          </option>
                        ))}
                    </Field>
                  </MutationForm>
                )}
                {plan.sessions.map((s) => (
                  <article key={s.id}>
                    <h3>
                      {new Date(s.sessionDate).toLocaleString()} ·{" "}
                      {s.cancelledAt
                        ? "Cancelled"
                        : s.isCompleted
                          ? "Completed"
                          : "Scheduled"}
                    </h3>
                    {s.rating && (
                      <p>
                        Performance: {s.rating}/10{" "}
                        <progress
                          value={s.rating}
                          max={10}
                          aria-label="Performance rating"
                        />
                      </p>
                    )}
                    <p>{s.trainerNote}</p>
                    {s.trialRun && (
                      <p>
                        Time {s.trialRun.finishTimeSeconds}s · Maximum speed{" "}
                        {s.trialRun.maxSpeedKmh} km/h · Heart rate{" "}
                        {s.trialRun.preHeartRate} → {s.trialRun.postHeartRate}{" "}
                        bpm{" "}
                        {s.trialRun.videoUrl && (
                          <a
                            href={s.trialRun.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View trial video
                          </a>
                        )}
                      </p>
                    )}
                    {trainer &&
                      !s.isCompleted &&
                      !s.cancelledAt &&
                      !horse.isTrainingLocked && (
                        <details>
                          <summary>Record assessment / trial run</summary>
                          <MutationForm
                            endpoint={
                              "/training/sessions/" + s.id + "/complete"
                            }
                            onSaved={refresh}
                            label="Complete session"
                          >
                            <Field
                              name="trainerNote"
                              label="Trainer assessment"
                              type="textarea"
                            />
                            <Field
                              name="rating"
                              label="Performance rating (1–10)"
                              type="number"
                              min={1}
                              max={10}
                            />
                            <Field
                              name="finishTimeSeconds"
                              label="Trial finish time (seconds)"
                              type="number"
                              min={0.01}
                              step="0.01"
                              required={false}
                            />
                            <Field
                              name="maxSpeedKmh"
                              label="Maximum speed (km/h)"
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              required={false}
                            />
                            <Field
                              name="preHeartRate"
                              label="Pre-exercise heart rate"
                              type="number"
                              min={10}
                              max={300}
                              required={false}
                            />
                            <Field
                              name="postHeartRate"
                              label="Post-exercise heart rate"
                              type="number"
                              min={10}
                              max={300}
                              required={false}
                            />
                            <Field
                              name="videoUrl"
                              label="Trial video URL (HTTPS)"
                              type="url"
                              required={false}
                            />
                          </MutationForm>
                        </details>
                      )}
                  </article>
                ))}
              </details>
            ))}
          </section>
          <section className="record-panel">
            <h2>Veterinary history</h2>
            {vet && (
              <>
                <details>
                  <summary>Record examination & injury</summary>
                  <MutationForm
                    endpoint="/health/records"
                    onSaved={refresh}
                    transform={(d) => ({ ...d, horseId: horse.id })}
                  >
                    <Field name="diagnosis" label="Diagnosis" type="textarea" />
                    <Field
                      name="treatmentPlan"
                      label="Treatment plan"
                      type="textarea"
                    />
                    <Field
                      name="prescription"
                      label="Prescription"
                      type="textarea"
                      required={false}
                    />
                    <Field
                      name="withdrawalDays"
                      label="Medication withdrawal (days)"
                      type="number"
                      min={0}
                      max={365}
                      defaultValue={0}
                    />
                    <Field name="healthStatus" label="Exam health status">
                      {["FIT", "WATCH", "INJURED", "QUARANTINE"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </Field>
                    <InjuryMap />
                    <Field
                      name="severity"
                      label="Injury severity"
                      required={false}
                    >
                      <option value="">No injury</option>
                      {["MILD", "MODERATE", "SEVERE"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </Field>
                    <Field
                      name="notes"
                      label="Injury / recovery notes"
                      type="textarea"
                      required={false}
                    />
                  </MutationForm>
                </details>
                <details>
                  <summary>
                    {horse.isTrainingLocked
                      ? "Release training lock"
                      : "Activate training lock"}
                  </summary>
                  <MutationForm
                    endpoint={
                      "/health/horses/" +
                      horse.id +
                      (horse.isTrainingLocked ? "/release-lock" : "/lock")
                    }
                    onSaved={refresh}
                    label={
                      horse.isTrainingLocked ? "Release lock" : "Lock training"
                    }
                  >
                    <Field
                      name="reason"
                      label={
                        horse.isTrainingLocked
                          ? "Follow-up assessment / release reason"
                          : "Medical restriction reason"
                      }
                      type="textarea"
                    />
                  </MutationForm>
                </details>
              </>
            )}
            {!horse.medicalRecords.length && <p>No examinations recorded.</p>}
            {horse.medicalRecords.map((r) => (
              <article key={r.id}>
                <h3>
                  {date(r.createdAt)} · {r.diagnosis}
                </h3>
                <p>{r.treatmentPlan}</p>
                <p>
                  {r.prescription || "No prescription"} · Withdrawal:{" "}
                  {r.withdrawalDays} days · {r.vet?.fullName}
                </p>
                {r.injuries.map((i) => (
                  <p key={i.id}>
                    {i.bodyLocation} · {i.severity} · {i.notes}
                  </p>
                ))}
              </article>
            ))}
          </section>
          <section className="record-panel">
            <h2>Preventive care</h2>
            {vet && (
              <details>
                <summary>Schedule care</summary>
                <MutationForm
                  endpoint="/health/care"
                  onSaved={refresh}
                  transform={(d) => ({ ...d, horseId: horse.id })}
                >
                  <Field name="careType" label="Care type">
                    {["VACCINATION", "DEWORMING", "FARRIER"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Field>
                  <Field name="scheduledDate" label="Due date" type="date" />
                </MutationForm>
              </details>
            )}
            {!horse.careSchedules.length && (
              <p>No preventive care scheduled.</p>
            )}
            {horse.careSchedules.map((c) => (
              <p key={c.id}>
                {date(c.scheduledDate)} · {c.careType} ·{" "}
                {c.isCompleted ? "Completed" : "Due"}{" "}
                {vet && !c.isCompleted && (
                  <Action
                    endpoint={"/health/care/" + c.id + "/complete"}
                    onSaved={refresh}
                  >
                    Mark complete
                  </Action>
                )}
              </p>
            ))}
          </section>
          <section className="record-panel">
            <h2>Race history</h2>
            {horse.raceEntries.length ? (
              horse.raceEntries.map((r) => (
                <p key={r.id}>
                  {date(r.raceDate)} · {r.raceName} ·{" "}
                  {r.result
                    ? "Rank " +
                      r.result.finishRank +
                      " · Prize " +
                      r.result.prizeMoney
                    : "Result pending"}
                </p>
              ))
            ) : (
              <p>No race entries recorded.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
