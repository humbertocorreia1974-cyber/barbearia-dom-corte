import { JgnextAssistant } from "@/components/jgnext-assistant";
import { SiteFooter } from '@/components/site-footer';
import { A11yPolish } from '@/components/a11y-polish';
import CookieConsent from '@/components/cookie-consent';
import { AppNav } from "@/components/app-nav";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import GuidePill from '@/components/guide-pill';

const body = Inter({ subsets: ["latin"], weight: ["400","700"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], weight: ["400","700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Barbearia Dom Corte",
  description: "Base full-stack: Next.js App Router + NextAuth + Prisma + Stripe.",
};

export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <A11yPolish />
        <Providers><AppNav />{children}<SiteFooter /></Providers>
              <JgnextAssistant />
        <CookieConsent />
        <GuidePill />
      </body>
    </html>
  );
}
