"use client";

import { useState } from "react";
import type { Participant } from "@/lib/db";
import { formatSlot, formatTime, shortDay, weekDates } from "@/lib/time";
import { RetryEmail } from "@/components/retry-email";

export function ManageEvent({ eventId, token, participants, availableSlots, week }: { eventId: string; token: string; participants: Participant[]; availableSlots: string[]; week: string }) {
  const [selected, setSelected] = useState("");
  const [activeDay, setActiveDay] = useState(availableSlots[0]?.slice(0, 10) || week);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [error, setError] = useState("");
  async function finalize() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/events/${eventId}/finalize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, time: selected }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not schedule the event.");
      setEmailSent(data.emailSent); setDone(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not schedule the event."); }
    finally { setBusy(false); }
  }
  if (done) return <div className="submitted-state"><span className="success-mark">✓</span><h2>It&apos;s on the calendar.</h2><p>Your group&apos;s meeting time is set for {formatSlot(selected)}.</p>{!emailSent && <p className="form-error">The time was saved, but one or more emails failed. Check the Resend logs, then retry.</p>}<RetryEmail eventId={eventId} token={token} /></div>;
  return <div className="manage-panel"><div className="slot-heading"><div><span className="section-label">FIND YOUR TIME</span><h2>Pick the time that works.</h2><p>Choose a slot everyone selected. Each number shows who can make it.</p></div><strong>{participants.length} {participants.length === 1 ? "response" : "responses"}</strong></div>
    <div className="weekdays" aria-label="Days of the week">{weekDates(week).map((day) => <button type="button" key={day} className={activeDay === day ? "weekday active" : "weekday"} onClick={() => setActiveDay(day)} aria-pressed={activeDay === day} disabled={!availableSlots.some((slot) => slot.startsWith(`${day}|`))}><strong>{shortDay(day).split(",")[0]}</strong><small>{shortDay(day).split(", ")[1]}</small></button>)}</div><div className="slot-grid">{availableSlots.filter((slot) => slot.startsWith(`${activeDay}|`)).map((slot) => { const count = participants.filter((p) => p.slots.includes(slot)).length; return <button className={`slot ${selected === slot ? "selected" : ""}`} type="button" key={slot} onClick={() => setSelected(slot)} aria-pressed={selected === slot}>{formatTime(slot.slice(11))}<span className="slot-count">{count}/{participants.length}</span></button>; })}</div>
    {selected && <p className="selection-note">{participants.filter((p) => p.slots.includes(selected)).length} of {participants.length} people are available on {formatSlot(selected)}.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" onClick={finalize} disabled={!selected || busy || !participants.length || participants.some((p) => !p.slots.includes(selected))}>{busy ? "Scheduling…" : "Confirm time & email group"}<span>↗</span></button>
    <p className="form-footnote">Everyone who responded will receive the final time by email.</p>
  </div>;
}

export function IndividualMeetings({ eventId, token, participants, availableSlots }: { eventId: string; token: string; participants: Participant[]; availableSlots: string[] }) {
  const [people, setPeople] = useState(participants);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const booked = people.map((p) => p.confirmed_time).filter(Boolean);
  async function book(person: Participant) {
    const time = selected[person.id];
    if (!time) return;
    setBusyId(person.id); setError(""); setEmailWarning("");
    try {
      const response = await fetch(`/api/events/${eventId}/meetings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, participantId: person.id, time }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not schedule this meeting.");
      setPeople((current) => current.map((p) => p.id === person.id ? { ...p, confirmed_time: time } : p));
      if (!data.emailSent) setEmailWarning(`Meeting with ${person.name} was saved, but email delivery failed. Check Resend and contact them directly.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not schedule this meeting."); }
    finally { setBusyId(""); }
  }
  return <div className="manage-panel"><div className="slot-heading"><div><span className="section-label">ONE-TO-ONE MEETINGS</span><h2>Schedule each person.</h2><p>Choose a time that works for both of you. Confirmed times can&apos;t be booked twice.</p></div><strong>{people.filter((p) => p.confirmed_time).length}/{people.length} booked</strong></div>
    {!people.length && <p className="empty-copy">No responses yet. Share the guest link to get started.</p>}
    <div className="individual-list">{people.map((person) => { const options = availableSlots.filter((slot) => person.slots.includes(slot) && !booked.includes(slot)); return <div className="individual-row" key={person.id}><div className="individual-person"><span className="person-avatar">{person.name.slice(0, 1).toUpperCase()}</span><div><strong>{person.name}</strong><small>{person.email}</small></div></div>{person.confirmed_time ? <span className="booked-badge">✓ {formatSlot(person.confirmed_time)} confirmed <RetryEmail eventId={eventId} token={token} participantId={person.id} /></span> : <div className="booking-controls"><select aria-label={`Meeting time for ${person.name}`} value={selected[person.id] || ""} onChange={(e) => setSelected((current) => ({ ...current, [person.id]: e.target.value }))}><option value="">Choose a time</option>{options.map((slot) => <option key={slot} value={slot}>{formatSlot(slot)}</option>)}</select><button type="button" disabled={!selected[person.id] || busyId === person.id} onClick={() => book(person)}>{busyId === person.id ? "Booking…" : "Confirm ↗"}</button></div>}</div>; })}</div>
    {error && <p className="form-error" role="alert">{error}</p>}{emailWarning && <p className="form-error" role="alert">{emailWarning}</p>}
  </div>;
}
