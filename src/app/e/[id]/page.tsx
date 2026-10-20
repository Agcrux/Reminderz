import { notFound } from "next/navigation";
import { getEvent, getParticipants } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/time";
import { AvailabilityForm } from "@/components/availability-form";

export const dynamic = "force-dynamic";

export default async function GuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const bookedTimes = event.mode === "individual" ? (await getParticipants(id)).map((person) => person.confirmed_time) : [];
  const availableSlots = event.organizer_slots.filter((time) => !bookedTimes.includes(time));
  return <main className="site-shell inner-shell"><header className="topbar"><a className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></a><span className="topbar-note">You&apos;re invited</span></header>
    <div className="page-intro"><span className="section-label">YOU&apos;RE INVITED</span><h1>Let&apos;s find a time<br/><em>that works.</em></h1><p>{event.organizer_name} wants to get everyone together. Add your availability below.</p></div>
    <div className="detail-card"><div><small>THE PLAN</small><strong>{event.title}</strong></div><div><small>THE DAY</small><strong>{formatDate(event.event_date)}</strong></div><div><small>MEETING STYLE</small><strong>{event.mode === "group" ? "One group meeting" : "Individual meetings"}</strong></div></div>
    <div className="content-card">{event.finalized_time ? <div className="submitted-state"><span className="success-mark">✓</span><h2>It&apos;s scheduled.</h2><p>{event.title} is set for {formatTime(event.finalized_time)} on {formatDate(event.event_date)} ({event.timezone}).</p></div> : availableSlots.length ? <AvailabilityForm eventId={id} timezone={event.timezone} availableSlots={availableSlots} mode={event.mode} /> : <div className="submitted-state"><h2>All times are booked.</h2><p>Ask {event.organizer_name} to make another day available.</p></div>}</div>
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
