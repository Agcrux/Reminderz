import { z } from "zod";
import { getBookings, getEvent } from "@/lib/db";
import { sendInvitation } from "@/lib/email";

const notifySchema = z.object({ token: z.string(), bookingId: z.uuid() });

export async function POST(request: Request, context: RouteContext<"/api/events/[id]/notify">) {
  try {
    const { id } = await context.params;
    const parsed = notifySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Invalid request." }, { status: 400 });
    const event = await getEvent(id);
    if (!event || event.manage_token !== parsed.data.token) return Response.json({ error: "Organizer link not found." }, { status: 404 });
    const booking = (await getBookings(id)).find((b) => b.id === parsed.data.bookingId);
    if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });
    await sendInvitation(event, booking, `${new URL(request.url).origin}/e/${id}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Invitation email failed", error);
    return Response.json({ error: "Email delivery failed. Check Resend settings and try again." }, { status: 502 });
  }
}
