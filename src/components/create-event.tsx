"use client";

import { useState, type FormEvent } from "react";
import { TIMES, formatTime, makeSlot, shortDay, weekDates, weekStart } from "@/lib/time";

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function CreateEvent({ emailReady }: { emailReady: boolean }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(localDate);
  const [activeDay, setActiveDay] = useState(localDate);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York");
  const [meetingLink, setMeetingLink] = useState("");
  const [organizerSlots, setOrganizerSlots] = useState<string[]>([]);
  const [result, setResult] = useState<{ id: string; token: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const days = weekDates(weekStart(date || localDate()));
  const selectedDay = days.includes(activeDay) ? activeDay : days[0];

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, date: weekStart(date), timezone, organizerName, organizerEmail, meetingLink, organizerSlots }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  if (result) {
    const guestUrl = `${window.location.origin}/e/${result.id}`;
    const manageUrl = `${window.location.origin}/manage/${result.id}/${result.token}`;
    return <div className="success-box"><div className="success-mark">✓</div><h3>Your link is ready.</h3><p>Share it with anyone who should book a time with you.</p>
      <div className="share-url">{guestUrl}</div>
      <button className="primary-button" onClick={async () => { await navigator.clipboard.writeText(guestUrl); setCopied(true); }}>{copied ? "Copied!" : "Copy booking link"} <span>↗</span></button>
      <a className="secondary-link" href={manageUrl}>See who&apos;s booked <span>↗</span></a>
      <p className="important-note">Save the organizer link. It&apos;s private and shows everyone&apos;s bookings.</p>
    </div>;
  }

  return <form className="stack-form" onSubmit={submit}>
    {!emailReady && <p className="setup-notice" role="status">Email setup is in progress. You can explore the form; event creation will open when delivery is ready.</p>}
    <label>MEETING NAME<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly check-in" required maxLength={100} /></label>
    <label>WHAT WEEK?<input type="date" value={date} min={localDate()} onChange={(e) => { setDate(e.target.value); setActiveDay(e.target.value); setOrganizerSlots([]); }} required /><small>Choose any date in the week. You can then set times for Monday through Sunday.</small></label>
    <div className="form-row"><label>YOUR NAME<input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="Your name" required maxLength={80} /></label><label>YOUR EMAIL<input type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder="you@example.com" required /></label></div>
    <label>TIME ZONE<input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/New_York" required /><small>Times will be shown in this time zone.</small></label>
    <label>ZOOM LINK<input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/1234567890" required maxLength={500} /><small>Everyone who books gets this link in their invitation.</small></label>
    <div className="creator-slots"><div className="creator-slots-heading"><span>WHEN ARE YOU AVAILABLE?</span><small>{organizerSlots.length} selected</small></div><p>Choose a weekday, then select your times. Guests can book any of them in {timezone.replaceAll("_", " ")}, and a time stays open after someone books it.</p><div className="weekdays" aria-label="Days of the week">{days.map((day) => <button type="button" key={day} className={selectedDay === day ? "weekday active" : "weekday"} onClick={() => setActiveDay(day)} disabled={day < localDate()} aria-pressed={selectedDay === day}><strong>{shortDay(day).split(",")[0]}</strong><small>{shortDay(day).split(", ")[1]}</small><span>{organizerSlots.filter((slot) => slot.startsWith(`${day}|`)).length || ""}</span></button>)}</div><div className="creator-slots-grid">{TIMES.map((time) => { const slot = makeSlot(selectedDay, time); return <button type="button" key={slot} aria-pressed={organizerSlots.includes(slot)} className={organizerSlots.includes(slot) ? "mini-slot selected" : "mini-slot"} onClick={() => setOrganizerSlots((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot].sort())}>{formatTime(time)}</button>; })}</div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" disabled={busy || !organizerSlots.length || !emailReady}>{busy ? "Creating…" : "Create my booking link"}<span>↗</span></button>
    <div className="form-footnote">No account needed. Just a good time.</div>
  </form>;
}
