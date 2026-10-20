import { CreateEvent } from "@/components/create-event";
import Link from "next/link";

export default function Home() {
  const emailReady = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
  return <main className="site-shell">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-icon">✳</span> reminderz<span className="brand-dot">.</span></Link><span className="topbar-note">Scheduling, together.</span></header>
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> THE EASIER WAY TO GET TOGETHER</div>
        <h1>One day.<br/><em>Everyone&apos;s</em><br/>availability.</h1>
        <p>Pick a day, share a link, and let your group tell you when they&apos;re free. Find your time without the back and forth.</p>
        <div className="hero-proof"><span className="avatar-stack"><i>J</i><i>M</i><i>A</i></span><span>Made for the whole group</span></div>
      </div>
      <div className="form-card"><div className="card-kicker">01 / CREATE YOUR EVENT</div><h2>Let&apos;s make it happen.</h2><p>Start with the basics. You can share your link in seconds.</p><CreateEvent emailReady={emailReady} /></div>
    </section>
    <section className="how"><div className="section-label">HOW IT WORKS</div><div className="how-grid"><div><span>01</span><h3>Choose a day</h3><p>Give the get-together a name and set the date.</p></div><div><span>02</span><h3>Share your link</h3><p>Everyone adds their name and available times.</p></div><div><span>03</span><h3>Make it official</h3><p>Pick a time and we&apos;ll email the group.</p></div></div></section>
    <footer>© {new Date().getFullYear()} reminderz <span>Less planning. More showing up.</span></footer>
  </main>;
}
