import { notFound } from "next/navigation";
import { getEvent, getParticipants } from "@/lib/db";
import { datePart, formatDate, formatSlot, weekDates } from "@/lib/time";
import { ManageEvent, IndividualMeetings } from "@/components/manage-event";
import { RetryEmail } from "@/components/retry-email";
import Link from "next/link";

export const metadata = { robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function ManagePage({ params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token } = await params;
  const event = await getEvent(id);
  if (!event || event.manage_token !== token) notFound();
  const participants = await getParticipants(id);
  const week = datePart(event.event_date);
  return <main className="site-shell inner-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></Link><span className="topbar-note">Organizer dashboard</span></header>
    <div className="page-intro"><span className="section-label">YOUR EVENT</span><h1>The group is<br/><em>coming together.</em></h1><p>Review everyone&apos;s times and make the plan official.</p></div>
    <div className="detail-card"><div><small>THE PLAN</small><strong>{event.title}</strong></div><div><small>THE WEEK</small><strong>{formatDate(week)} – {formatDate(weekDates(week)[6])}</strong></div><div><small>GUEST LINK</small><a href={`/e/${id}`}>Open & share ↗</a></div></div>
    <div className="content-card">{event.mode === "individual" ? <IndividualMeetings eventId={id} token={token} participants={participants} availableSlots={event.organizer_slots} /> : event.finalized_time ? <div className="submitted-state"><span className="success-mark">✓</span><h2>It&apos;s scheduled.</h2><p>{event.title} is set for {formatSlot(event.finalized_time)} ({event.timezone}).</p><RetryEmail eventId={id} token={token} /></div> : <ManageEvent eventId={id} token={token} participants={participants} availableSlots={event.organizer_slots} week={week} />}</div>
    {event.mode === "group" && <div className="responses"><div className="slot-heading"><div><span className="section-label">THE PEOPLE</span><h2>Who&apos;s coming along.</h2></div><strong>{participants.length} total</strong></div>{participants.length ? <div className="response-list">{participants.map((p) => <div className="response-row" key={p.id}><span className="person-avatar">{p.name.slice(0, 1).toUpperCase()}</span><div><strong>{p.name}</strong><small>{p.email}</small></div><span>{p.slots.length} times selected</span></div>)}</div> : <p className="empty-copy">No responses yet. Share the guest link to get started.</p>}</div>}
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
