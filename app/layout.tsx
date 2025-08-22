import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomodorin - Focus Timer",
  description: "A beautiful Pomodoro timer app to help you stay focused and productive",
  keywords: ["pomodoro", "timer", "productivity", "focus", "work", "study"],
  authors: [{ name: "Pomodorin" }],
  creator: "Pomodorin",
  publisher: "Pomodorin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pomodorin.babon.io",
    siteName: "Pomodorin",
    title: "Pomodorin - Focus Timer",
    description: "A beautiful Pomodoro timer app to help you stay focused and productive. Features AI-generated motivational quotes, ambient music, and note-taking capabilities.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Pomodorin - Focus Timer App",
        type: "image/png",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@pomodorin",
    creator: "@pomodorin", 
    title: "Pomodorin - Focus Timer",
    description: "A beautiful Pomodoro timer app to help you stay focused and productive",
    images: ["/opengraph-image.png"],
  },
  metadataBase: new URL("https://pomodorin.babon.io"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
