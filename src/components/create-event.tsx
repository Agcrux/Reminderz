"use client";

import { useState, type FormEvent } from "react";
import { TIMES, formatTime } from "@/lib/time";

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CreateEvent({ emailReady }: { emailReady: boolean }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(localDate);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York");
  const [mode, setMode] = useState<"group" | "individual">("group");
  const [organizerSlots, setOrganizerSlots] = useState<string[]>([]);
  const [result, setResult] = useState<{ id: string; token: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, date, timezone, organizerName, organizerEmail, mode, organizerSlots }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  if (result) {
    const guestUrl = `${window.location.origin}/e/${result.id}`;
    const manageUrl = `${window.location.origin}/manage/${result.id}/${result.token}`;
    return <div className="success-box"><div className="success-mark">✓</div><h3>Your link is ready.</h3><p>Send this link to everyone you want to meet with.</p>
      <div className="share-url">{guestUrl}</div>
      <button className="primary-button" onClick={async () => { await navigator.clipboard.writeText(guestUrl); setCopied(true); }}>{copied ? "Copied!" : "Copy guest link"} <span>↗</span></button>
      <a className="secondary-link" href={manageUrl}>Open your organizer dashboard <span>↗</span></a>
      <p className="important-note">Save the organizer link. It&apos;s private and gives access to everyone&apos;s responses.</p>
    </div>;
  }

  return <form className="stack-form" onSubmit={submit}>
    {!emailReady && <p className="setup-notice" role="status">Email setup is in progress. You can explore the form; event creation will open when delivery is ready.</p>}
    <label>WHAT ARE WE PLANNING?<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Friday team catch-up" required maxLength={100} /></label>
    <label>WHAT DAY?<input type="date" value={date} min={localDate()} onChange={(e) => setDate(e.target.value)} required /></label>
    <div className="form-row"><label>YOUR NAME<input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="Your name" required maxLength={80} /></label><label>YOUR EMAIL<input type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder="you@example.com" required /></label></div>
    <label>TIME ZONE<input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/New_York" required /><small>Times will be shown in this time zone.</small></label>
    <div className="mode-field"><span>HOW WOULD YOU LIKE TO MEET?</span><div className="mode-options"><button type="button" className={mode === "group" ? "mode-option active" : "mode-option"} onClick={() => setMode("group")}><strong>As a group</strong><small>One time for everyone</small></button><button type="button" className={mode === "individual" ? "mode-option active" : "mode-option"} onClick={() => setMode("individual")}><strong>Individually</strong><small>A time for each person</small></button></div></div>
    <div className="creator-slots"><div className="creator-slots-heading"><span>WHEN ARE YOU AVAILABLE?</span><small>{organizerSlots.length} selected</small></div><p>Guests will only see the times you choose. Times are in {timezone.replaceAll("_", " ")}.</p><div className="creator-slots-grid">{TIMES.map((time) => <button type="button" key={time} aria-pressed={organizerSlots.includes(time)} className={organizerSlots.includes(time) ? "mini-slot selected" : "mini-slot"} onClick={() => setOrganizerSlots((current) => current.includes(time) ? current.filter((slot) => slot !== time) : [...current, time].sort())}>{formatTime(time)}</button>)}</div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" disabled={busy || !organizerSlots.length || !emailReady}>{busy ? "Creating…" : "Create your event"}<span>↗</span></button>
    <div className="form-footnote">No account needed. Just a good time.</div>
  </form>;
}
