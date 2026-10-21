"use client";

import { useState, type FormEvent } from "react";
import { formatSlot, formatTime, shortDay, shortSlot, weekDates } from "@/lib/time";

type Booked = { slot: string; meetingLink: string; emailSent: boolean };

export function BookingForm({ eventId, title, organizerName, timezone, week, openSlots }: { eventId: string; title: string; organizerName: string; timezone: string; week: string; openSlots: string[] }) {
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [error, setError] = useState("");
  const days = weekDates(week);
  const [activeDay, setActiveDay] = useState(openSlots[0]?.slice(0, 10) || days[0]);
  const zone = timezone.replaceAll("_", " ");

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/events/${eventId}/bookings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, slot }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not book this time.");
      setBooked(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not book this time."); }
    finally { setBusy(false); }
  }
  if (booked) return <div className="submitted-state"><span className="success-mark">✓</span><h2>You&apos;re booked.</h2><p>{title} with {organizerName} is set for {formatSlot(booked.slot)} ({zone}).</p>
    <a className="primary-button join-button" href={booked.meetingLink} target="_blank" rel="noopener noreferrer">Join on Zoom<span>↗</span></a>
    <p className="form-footnote">{booked.emailSent ? `We emailed your invitation with this link to ${email}.` : "We couldn't email your invitation, so save this Zoom link."} Need a different time? Book again with the same email.</p></div>;
  return <form onSubmit={submit} className="booking-form">
    <div className="slot-heading"><div><span className="section-label">PICK A TIME</span><h2>When works for you?</h2><p>All times are in {zone}.</p></div></div>
    <div className="weekdays" aria-label="Days of the week">{days.map((day) => <button type="button" key={day} className={activeDay === day ? "weekday active" : "weekday"} onClick={() => setActiveDay(day)} aria-pressed={activeDay === day} disabled={!openSlots.some((item) => item.startsWith(`${day}|`))}><strong>{shortDay(day).split(",")[0]}</strong><small>{shortDay(day).split(", ")[1]}</small><span>{slot.startsWith(`${day}|`) ? "✓" : ""}</span></button>)}</div><div className="slot-grid">{openSlots.filter((item) => item.startsWith(`${activeDay}|`)).map((item) => <button className={slot === item ? "slot selected" : "slot"} type="button" key={item} onClick={() => setSlot(item)} aria-pressed={slot === item}>{formatTime(item.slice(11))}<span>{slot === item ? "✓" : "+"}</span></button>)}</div>
    <div className="field-pair"><label>YOUR NAME<input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last name" required maxLength={80} /></label><label>EMAIL ADDRESS<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" disabled={busy || !slot}>{busy ? "Booking…" : slot ? `Book ${shortSlot(slot)}` : "Choose a time to book"}<span>↗</span></button>
    <p className="form-footnote">Already booked? Book again with the same email to move your meeting.</p>
  </form>;
}
