import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Remove external Google font usage for offline readiness
// Use system fonts via Tailwind config or CSS

export const metadata: Metadata = {
  title: "SOLAR Hub - Solution Collaboration Platform",
  description:
    "Comprehensive solar energy project management system. Track solar projects, tasks, resources, budgets, and costs with role-based access control.",
  keywords: [
    "solar energy",
    "project management",
    "solar projects",
    "task tracking",
    "resource management",
    "budget tracking",
    "cost estimation",
  ],
  authors: [{ name: "SOLAR Hub Team" }],
  openGraph: {
    title: "SOLAR Hub - Collaboration Platform",
    description: "Comprehensive Solution Architect Collaboration Platform",
    // url removed to avoid external references on offline deployments
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
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
