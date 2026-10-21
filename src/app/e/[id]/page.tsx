import { notFound } from "next/navigation";
import { getEvent } from "@/lib/db";
import { formatWeek, isUpcoming } from "@/lib/time";
import { BookingForm } from "@/components/booking-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const week = event.event_date;
  const openSlots = event.organizer_slots.filter((slot) => isUpcoming(slot, event.timezone));
  return <main className="site-shell inner-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></Link><span className="topbar-note">Book a meeting</span></header>
    <div className="page-intro"><h1>Book a meeting with {event.organizer_name}</h1><p>Choose an open time below. You&apos;ll get the Zoom link as soon as you book.</p></div>
    <div className="detail-card"><div><small>Meeting</small><strong>{event.title}</strong></div><div><small>Week</small><strong>{formatWeek(week)}</strong></div><div><small>Where</small><strong>Zoom, link shared after booking</strong></div></div>
    <div className="content-card">{openSlots.length ? <BookingForm eventId={id} title={event.title} organizerName={event.organizer_name} timezone={event.timezone} week={week} openSlots={openSlots} /> : <div className="submitted-state"><h2>No times left this week</h2><p>Ask {event.organizer_name} to share a new week.</p></div>}</div>
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
