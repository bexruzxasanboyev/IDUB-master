"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { markDramaViewed } from "@/lib/api";

export default function ViewTracker({ dramaId }: { dramaId: string }) {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    markDramaViewed(dramaId, token).catch(() => {});
  }, [dramaId, token]);

  return null;
}
