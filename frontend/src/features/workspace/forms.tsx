import { useId, useState, type FormEvent, type ReactNode } from "react";
import { apiClient } from "@/shared/lib/api";
export function Field({
  name,
  label,
  type = "text",
  required = true,
  children,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  children?: ReactNode;
  min?: number;
  max?: number;
  step?: string;
  defaultValue?: string | number;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children ? (
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={props.defaultValue}
        >
          {children}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          required={required}
          defaultValue={props.defaultValue}
          maxLength={props.maxLength || 3000}
        />
      ) : (
        <input id={id} name={name} type={type} required={required} {...props} />
      )}
    </div>
  );
}
export function MutationForm({
  endpoint,
  method = "POST",
  children,
  onSaved,
  label = "Save",
  transform,
}: {
  endpoint: string;
  method?: string;
  children: ReactNode;
  onSaved: () => void;
  label?: string;
  transform?: (data: Record<string, unknown>) => Record<string, unknown>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values: Record<string, unknown> = {};
    for (const [key, value] of new FormData(form).entries()) {
      if (value === "") continue;
      const control = form.elements.namedItem(key) as HTMLInputElement;
      values[key] = control?.type === "number" ? Number(value) : value;
    }
    setBusy(true);
    setError("");
    try {
      await apiClient(endpoint, {
        method,
        body: JSON.stringify(transform ? transform(values) : values),
      });
      form.reset();
      window.dispatchEvent(new Event("equiflow:records-changed"));
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="record-form" onSubmit={submit}>
      {children}
      {error && (
        <p className="record-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button disabled={busy}>{busy ? "Saving…" : label}</button>
      </div>
    </form>
  );
}
export function Action({
  endpoint,
  children,
  onSaved,
  body = {},
}: {
  endpoint: string;
  children: ReactNode;
  onSaved: () => void;
  body?: unknown;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <span>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await apiClient(endpoint, {
              method: "POST",
              body: JSON.stringify(body),
            });
            window.dispatchEvent(new Event("equiflow:records-changed"));
            onSaved();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
          } finally {
            setBusy(false);
          }
        }}
      >
        {children}
      </button>
      {error && <span role="alert">{error}</span>}
    </span>
  );
}
