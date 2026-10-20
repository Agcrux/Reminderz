import { notFound } from "next/navigation";
import { getEvent, getParticipants } from "@/lib/db";
import { datePart, formatDate, formatSlot, weekDates } from "@/lib/time";
import { AvailabilityForm } from "@/components/availability-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const bookedTimes = event.mode === "individual" ? (await getParticipants(id)).map((person) => person.confirmed_time) : [];
  const availableSlots = event.organizer_slots.filter((time) => !bookedTimes.includes(time));
  const week = datePart(event.event_date);
  return <main className="site-shell inner-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></Link><span className="topbar-note">You&apos;re invited</span></header>
    <div className="page-intro"><span className="section-label">YOU&apos;RE INVITED</span><h1>Let&apos;s find a time<br/><em>that works.</em></h1><p>{event.organizer_name} wants to get everyone together. Add your availability below.</p></div>
    <div className="detail-card"><div><small>THE PLAN</small><strong>{event.title}</strong></div><div><small>THE WEEK</small><strong>{formatDate(week)} – {formatDate(weekDates(week)[6])}</strong></div><div><small>MEETING STYLE</small><strong>{event.mode === "group" ? "One group meeting" : "Individual meetings"}</strong></div></div>
    <div className="content-card">{event.finalized_time ? <div className="submitted-state"><span className="success-mark">✓</span><h2>It&apos;s scheduled.</h2><p>{event.title} is set for {formatSlot(event.finalized_time)} ({event.timezone}).</p></div> : availableSlots.length ? <AvailabilityForm eventId={id} timezone={event.timezone} week={week} availableSlots={availableSlots} mode={event.mode} /> : <div className="submitted-state"><h2>All times are booked.</h2><p>Ask {event.organizer_name} to make another week available.</p></div>}</div>
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
