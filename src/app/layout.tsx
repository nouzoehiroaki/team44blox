import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./reset.css";
import Header from '../components/Header';
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEAM44BLOX Official Website",
  description: "千葉、茨城など常磐線沿線を中心に結成されたHIPHOP SQUAD。TEAM44BLOXのオフィシャルウェブサイト",
  openGraph: {
    type: "website",
    title: "TEAM44BLOX Official Website",
    description:
      "千葉、茨城など常磐線沿線を中心に結成されたHIPHOP SQUAD。TEAM44BLOXのオフィシャルウェブサイト",
    siteName: "TEAM44BLOX Official Website",
    images: "/og.png",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    images: "/og.png",
  },
  viewport: "width=device-width, initial-scale=1",
  metadataBase: new URL("https://team44blox.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}


