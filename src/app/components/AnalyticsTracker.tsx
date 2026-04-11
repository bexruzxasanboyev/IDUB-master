"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { sendAnalyticsEvent } from "@/lib/api";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    sendAnalyticsEvent(token, {
      event: "page_view",
      screen: pathname,
    }).catch(() => {});
  }, [pathname, token]);

  return null;
}
