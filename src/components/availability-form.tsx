"use client";

import { useState, type FormEvent } from "react";
import { formatTime, shortDay, weekDates } from "@/lib/time";

export function AvailabilityForm({ eventId, timezone, week, availableSlots, mode }: { eventId: string; timezone: string; week: string; availableSlots: string[]; mode: "group" | "individual" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const days = weekDates(week);
  const [activeDay, setActiveDay] = useState(availableSlots[0]?.slice(0, 10) || days[0]);

  function toggle(slot: string) { setSlots((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot].sort()); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/events/${eventId}/availability`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, slots }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your availability.");
      setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save your availability."); }
    finally { setBusy(false); }
  }
  if (saved) return <div className="submitted-state"><span className="success-mark">✓</span><h2>You&apos;re on the list.</h2><p>Your availability has been saved. We&apos;ll email you when {mode === "group" ? "the group time is" : "your meeting is"} set.</p></div>;
  return <form onSubmit={submit} className="availability-form">
    <div className="field-pair"><label>YOUR NAME<input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" required maxLength={80} /></label><label>EMAIL ADDRESS<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label></div>
    <div className="slot-heading"><div><span className="section-label">YOUR AVAILABILITY</span><h2>When are you free?</h2><p>Pick every time that works. All times are in {timezone.replaceAll("_", " ")}.</p></div><strong>{slots.length} selected</strong></div>
    <div className="weekdays" aria-label="Days of the week">{days.map((day) => <button type="button" key={day} className={activeDay === day ? "weekday active" : "weekday"} onClick={() => setActiveDay(day)} aria-pressed={activeDay === day} disabled={!availableSlots.some((slot) => slot.startsWith(`${day}|`))}><strong>{shortDay(day).split(",")[0]}</strong><small>{shortDay(day).split(", ")[1]}</small><span>{slots.filter((slot) => slot.startsWith(`${day}|`)).length || ""}</span></button>)}</div><div className="slot-grid">{availableSlots.filter((slot) => slot.startsWith(`${activeDay}|`)).map((slot) => <button className={slots.includes(slot) ? "slot selected" : "slot"} type="button" key={slot} onClick={() => toggle(slot)} aria-pressed={slots.includes(slot)}>{formatTime(slot.slice(11))}<span>{slots.includes(slot) ? "✓" : "+"}</span></button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" disabled={busy || slots.length === 0}>{busy ? "Saving…" : "Send my availability"}<span>↗</span></button>
    <p className="form-footnote">Already responded? Submit again with the same email to update your times.</p>
  </form>;
}
