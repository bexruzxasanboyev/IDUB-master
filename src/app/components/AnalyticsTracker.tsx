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

    // Fire analytics in the next idle frame so it never blocks
    // navigation or above-the-fold rendering.
    let handle: number | undefined;
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    const cic = (window as any).cancelIdleCallback as
      | ((id: number) => void)
      | undefined;

    const send = () => {
      sendAnalyticsEvent(token, {
        event: "page_view",
        screen: pathname,
      }).catch(() => {});
    };

    if (ric) {
      handle = ric(send, { timeout: 3000 });
    } else {
      handle = window.setTimeout(send, 1500) as unknown as number;
    }

    return () => {
      if (handle === undefined) return;
      if (ric && cic) cic(handle);
      else clearTimeout(handle);
    };
  }, [pathname, token]);

  return null;
}
