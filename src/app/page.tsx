import { CreateEvent } from "@/components/create-event";
import Link from "next/link";

export default function Home() {
  const emailReady = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
  return <main className="site-shell">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></Link></header>
    <section className="home-form">
      <div className="form-card"><h1>Share your availability</h1><p>Pick your free times for one week and add your Zoom link. Anyone with your booking link can then book a meeting with you.</p><CreateEvent emailReady={emailReady} /></div>
    </section>
    <footer>© {new Date().getFullYear()} reminderz</footer>
  </main>;
}
