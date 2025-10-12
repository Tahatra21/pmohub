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
  title: "ProjectHub - Project Management System",
  description: "Comprehensive project management system for electrical and IT projects. Track projects, tasks, resources, budgets, and risks with role-based access control.",
  keywords: ["project management", "electrical projects", "IT projects", "task tracking", "resource management", "budget tracking", "risk management"],
  authors: [{ name: "ProjectHub Team" }],
  openGraph: {
    title: "ProjectHub - Project Management System",
    description: "Comprehensive project management for electrical and IT projects",
    url: "https://projecthub.com",
    siteName: "ProjectHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectHub - Project Management System",
    description: "Comprehensive project management for electrical and IT projects",
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
