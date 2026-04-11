import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "IDUB — Koreya Dramalari va Filmlar",
  description: "O'zbek tilidagi eng yaxshi koreya dramalari, filmlar va seriallarni tomosha qiling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        suppressHydrationWarning
        className="antialiased bg-main font-text text-white"
      >
        <AuthProvider>
          <Header />
          {children}
          <ScrollToTop />
          <AnalyticsTracker />
        </AuthProvider>
      </body>
    </html>
  );
}
