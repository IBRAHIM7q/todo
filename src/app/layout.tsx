import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Productivity Dashboard",
  description: "Modern productivity dashboard with AI-powered task management and focus tracking",
  keywords: ["Productivity", "Dashboard", "AI", "Task Management", "Focus Timer"],
  authors: [{ name: "Productivity Dashboard" }],
  openGraph: {
    title: "AI Productivity Dashboard",
    description: "Modern productivity dashboard with AI-powered insights and task management",
    url: "https://localhost:3000",
    siteName: "Productivity Dashboard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Productivity Dashboard",
    description: "Modern productivity dashboard with AI-powered insights and task management",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
