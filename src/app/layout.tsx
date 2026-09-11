import type { Metadata, Viewport } from "next";
import "./globals.css";
import TiunProvider from "@/components/TiunProvider";

export const metadata: Metadata = {
  title: "ShipZen — Ship Without Burning Out",
  description:
    "Developer productivity + wellness dashboard. Break down tasks with AI, track focus sessions, and prevent burnout.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ShipZen — Ship Without Burning Out",
    description:
      "Developer productivity + wellness dashboard. AI task breakdown, Pomodoro timer, burnout detection, and Ship Score.",
    url: "https://shipzen.vercel.app",
    siteName: "ShipZen",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ShipZen — Ship Without Burning Out",
    description:
      "AI task breakdown, Pomodoro timer, burnout detection & Ship Score for developers.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <TiunProvider>{children}</TiunProvider>
      </body>
    </html>
  );
}
