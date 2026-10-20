"use client";

import { useState } from "react";

export function RetryEmail({ eventId, token, participantId }: { eventId: string; token: string; participantId?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function sendAgain() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/events/${eventId}/notify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, participantId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Email delivery failed.");
      setMessage("Email sent.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Email delivery failed."); }
    finally { setBusy(false); }
  }
  return <span className="retry-email"><button type="button" disabled={busy} onClick={sendAgain}>{busy ? "Sending…" : "Resend email"}</button>{message && <small role="status">{message}</small>}</span>;
}
