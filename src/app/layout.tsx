import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reminderz — Share your week, get booked",
  description: "Share your availability for the week and let people book a Zoom meeting with you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
