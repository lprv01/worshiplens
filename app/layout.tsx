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
  metadataBase: new URL("https://www.worshiplens.com"),
  title: {
    default: "WorshipLens | Theological Reviews of Worship Songs",
    template: "%s | WorshipLens",
  },
  description:
    "Theological reviews of over 1,000 worship songs. Scriptural fidelity, doctrinal clarity, singability, and lyrical quality, scored and explained for worship leaders.",
  keywords: [
    "worship songs",
    "theological review",
    "worship leader resources",
    "song selection",
    "church music",
  ],
  authors: [{ name: "Ludwingk Rios" }],
  openGraph: {
    title: "WorshipLens | Theological Reviews of Worship Songs",
    description:
      "Theological reviews of over 1,000 worship songs, built for worship leaders choosing what their church will sing.",
    url: "https://www.worshiplens.com",
    siteName: "WorshipLens",
    locale: "en_US",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "WorshipLens | Theological Reviews of Worship Songs",
    description:
      "Theological reviews of over 1,000 worship songs, built for worship leaders.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
