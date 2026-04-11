"use client";

import { useState } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useAuth } from "@/lib/auth";
import { addSaved, removeSaved } from "@/lib/api";

export default function SaveButton({ dramaId }: { dramaId: string }) {
  const { token } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!token) {
      // Not logged in — just toggle locally
      setSaved(!saved);
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await removeSaved(token, dramaId);
      } else {
        await addSaved(token, dramaId);
      }
      setSaved(!saved);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/10 transition-all duration-200 active:scale-95 text-sm disabled:opacity-50"
    >
      {saved ? (
        <FaBookmark className="text-second text-xs" />
      ) : (
        <FaRegBookmark className="text-gray-400 text-xs" />
      )}
      {saved ? "Saqlangan" : "Saqlash"}
    </button>
  );
}
