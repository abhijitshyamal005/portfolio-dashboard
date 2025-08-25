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
  title: "Portfolio Dashboard - Real-time Stock Tracking",
  description: "Dynamic portfolio dashboard with real-time stock data, sector analysis, and performance tracking",
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
        {/* Global Disclaimer */}
        <div className="w-full bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 text-center py-2 px-4 text-xs font-semibold border-b border-yellow-300 dark:border-yellow-800">
          <span className="font-bold">Disclaimer:</span> This dashboard uses unofficial APIs and web scraping for financial data. Data may be delayed or inaccurate. Do not use for trading decisions. Always verify with official sources.
        </div>
        {children}
      </body>
    </html>
  );
}
