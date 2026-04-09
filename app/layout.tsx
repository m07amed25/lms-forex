import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Forex with Salma",
    default: "Forex with Salma - Professional Forex Trading Education",
  },
  description:
    "Master the forex market with Forex with Salma. Comprehensive courses, live trading sessions, and expert mentoring for traders of all levels.",
  keywords: [
    "Forex",
    "Trading",
    "LMS",
    "Forex Education",
    "Trading Courses",
    "Financial Markets",
    "Technical Analysis",
  ],
  authors: [{ name: "Salma Yousef" }, { name: "Mohamed Reda" }],
  openGraph: {
    title: "Forex with Salma - Professional Forex Trading Education",
    description:
      "Master the forex market with comprehensive courses, live trading sessions, and expert mentoring.",
    siteName: "Forex with Salma",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
