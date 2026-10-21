import { notFound } from "next/navigation";
import { getEvent } from "@/lib/db";
import { formatDate, isUpcoming, weekDates } from "@/lib/time";
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
    <div className="page-intro"><span className="section-label">BOOK A MEETING</span><h1>Pick a time<br/><em>that works for you.</em></h1><p>{event.organizer_name} shared their availability for the week. Choose a time to book your meeting.</p></div>
    <div className="detail-card"><div><small>THE MEETING</small><strong>{event.title}</strong></div><div><small>THE WEEK</small><strong>{formatDate(week)} – {formatDate(weekDates(week)[6])}</strong></div><div><small>WHERE</small><strong>Zoom, link sent when you book</strong></div></div>
    <div className="content-card">{openSlots.length ? <BookingForm eventId={id} title={event.title} organizerName={event.organizer_name} timezone={event.timezone} week={week} openSlots={openSlots} /> : <div className="submitted-state"><h2>No times left this week.</h2><p>Ask {event.organizer_name} to share a new week.</p></div>}</div>
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
