import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reminderz — Get everyone together",
  description: "A simple way to find a time that works for your whole group.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
