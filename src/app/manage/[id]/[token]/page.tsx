import { notFound } from "next/navigation";
import { getBookings, getEvent } from "@/lib/db";
import { formatWeek, shortSlot } from "@/lib/time";
import { RetryEmail } from "@/components/retry-email";
import Link from "next/link";

export const metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function ManagePage({ params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token } = await params;
  const event = await getEvent(id);
  if (!event || event.manage_token !== token) notFound();
  const bookings = await getBookings(id);
  const bookedSlots = [...new Set(bookings.map((booking) => booking.slot))];
  return <main className="site-shell inner-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></Link><span className="topbar-note">Organizer dashboard</span></header>
    <div className="page-intro"><h1>Your bookings</h1><p>Anyone with your booking link can pick an open time. Booked times stay open for others.</p></div>
    <div className="detail-card with-zoom"><div><small>Meeting</small><strong>{event.title}</strong></div><div><small>Week</small><strong>{formatWeek(event.event_date)}</strong></div><div><small>Zoom</small><a href={event.meeting_link} target="_blank" rel="noopener noreferrer">Open link ↗</a></div><div><small>Booking link</small><a href={`/e/${id}`}>Open and share ↗</a></div></div>
    <div className="responses"><div className="slot-heading"><div><h2>Who&apos;s booked</h2></div><strong>{bookings.length} {bookings.length === 1 ? "booking" : "bookings"}</strong></div>{bookedSlots.length ? <div className="booking-list">{bookedSlots.map((slot) => { const people = bookings.filter((booking) => booking.slot === slot); return <div className="booking-group" key={slot}><div className="booking-time"><strong>{shortSlot(slot)}</strong><small>{people.length} {people.length === 1 ? "person" : "people"}</small></div>{people.map((p) => <div className="response-row" key={p.id}><span className="person-avatar">{p.name.slice(0, 1).toUpperCase()}</span><div><strong>{p.name}</strong><small>{p.email}</small></div><RetryEmail eventId={id} token={token} bookingId={p.id} /></div>)}</div>; })}</div> : <p className="empty-copy">No bookings yet. Share your booking link to get started.</p>}</div>
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
