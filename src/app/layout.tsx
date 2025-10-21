import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOLAR Hub - Solution Collaboration Platform",
  description: "Comprehensive solar energy project management system. Track solar projects, tasks, resources, budgets, and costs with role-based access control.",
  keywords: ["solar energy", "project management", "solar projects", "task tracking", "resource management", "budget tracking", "cost estimation"],
  authors: [{ name: "SOLAR Hub Team" }],
  openGraph: {
    title: "SOLAR Hub - Collaboration Platform",
    description: "Comprehensive Solution Architect Collaboration Platform",
    url: "https://solarhub.com",
    siteName: "SOLAR Hub",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
