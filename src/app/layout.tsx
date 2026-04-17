import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { AuthProvider } from "@/lib/auth";
import { SavedProvider } from "@/lib/saved-context";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "https://idub.uz"
).replace(/\/$/, "");

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://idubbackend.asosit.uz";

// Self-hosted fonts via next/font — automatic preload, subset, size-adjust,
// and a CSS variable exposed to Tailwind's @theme in globals.css.
const fontSora = localFont({
  src: "./fonts/Sora-VariableFont_wght.ttf",
  variable: "--font-sora",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});
const fontJakarta = localFont({
  src: "./fonts/PlusJakartaSans-VariableFont_wght.ttf",
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});
const fontManrope = localFont({
  src: "./fonts/Manrope-VariableFont_wght.ttf",
  variable: "--font-manrope",
  display: "swap",
  preload: false, // Secondary UI font — don't block
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IDUB — Koreya Dramalari va Filmlar O'zbek Tilida",
    template: "%s | IDUB",
  },
  description:
    "IDUB — O'zbek tilidagi eng yaxshi koreya dramalari, filmlar va seriallarni onlayn tomosha qilish platformasi. Yangi qismlar, premyeralar va eksklyuziv kontent.",
  keywords: [
    "IDUB",
    "koreya dramasi",
    "koreya filmi",
    "dorama",
    "o'zbek tilida",
    "online tomosha",
    "kdrama",
    "k-drama",
    "serial",
    "film",
  ],
  applicationName: "IDUB",
  authors: [{ name: "IDUB" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "IDUB",
    title: "IDUB — Koreya Dramalari va Filmlar O'zbek Tilida",
    description:
      "O'zbek tilidagi eng yaxshi koreya dramalari, filmlar va seriallarni onlayn tomosha qiling.",
    url: SITE_URL,
    locale: "uz_UZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "IDUB — Koreya Dramalari va Filmlar",
    description:
      "O'zbek tilidagi eng yaxshi koreya dramalari va filmlarini tomosha qiling.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uz"
      className={`${fontSora.variable} ${fontJakarta.variable} ${fontManrope.variable}`}
    >
      <head>
        {/* Start the TCP/TLS handshake to the API + image origin ASAP so
            above-the-fold banner images and /home fetch begin with zero
            connection overhead. */}
        <link rel="preconnect" href={API_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={API_URL} />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased bg-main font-text text-white"
      >
        <AuthProvider>
          <SavedProvider>
            <Header />
            {children}
            <ScrollToTop />
            <AnalyticsTracker />
          </SavedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
