import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const viewport: Viewport = {
  themeColor: "#5c9966",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "LearnLens AI",
  description: "Marks tell you what you scored. LearnLens helps you understand why.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LearnLens AI",
  }
};

import { PWAPrompt } from "@/components/pwa-prompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col selection:bg-primary/20 selection:text-foreground`}>
        {children}
        <PWAPrompt />
      </body>
    </html>
  );
}
