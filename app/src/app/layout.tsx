import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Nunito_Sans } from "next/font/google";
// Experimental View Transitions API (enabled via experimental.viewTransition).
import { ViewTransition } from "react";
import "./globals.css";
import { ANIMATIONS_INIT_SCRIPT } from "@/features/gantt/lib/preferences";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const nunitoSansHeading = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "gantt-ng — Simple Gantt charts",
  description:
    "Local-first Gantt chart builder. Your data stays in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        montserrat.variable,
        nunitoSansHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* Apply the saved animations preference before first paint (no flash). */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted static preference bootstrap */}
        <script dangerouslySetInnerHTML={{ __html: ANIMATIONS_INIT_SCRIPT }} />
        <Providers>
          <ViewTransition>{children}</ViewTransition>
        </Providers>
      </body>
    </html>
  );
}
