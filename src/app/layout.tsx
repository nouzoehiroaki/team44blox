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
  title: "Team 44 Blox official Website",
  description: "千葉、茨城近辺を中心に自然発生するCREATIVE集団。 HIPHOPカルチャーをベースに、地域世代をこえ、現在もその母体を広げ続けている",
  openGraph: {
    type: "website",
    title: "Team 44 Blox official Website",
    description:
      "千葉、茨城近辺を中心に自然発生するCREATIVE集団。 HIPHOPカルチャーをベースに、地域世代をこえ、現在もその母体を広げ続けている",
    siteName: "Team 44 Blox official Website",
    images: "/og.png",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    images: "/og.png",
  },
  viewport: "width=device-width, initial-scale=1",
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


