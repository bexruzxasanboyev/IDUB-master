"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getHistory, bulkRemoveHistory, type HistoryItem } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../components/BreadCrumb";
import { FaPlay, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

export default function TarixPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getHistory(token)
      .then((data) => setItems(data.items))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const handleRemove = async (dramaId: string) => {
    if (!token) return;
    try {
      await bulkRemoveHistory(token, [dramaId]);
      setItems((prev) => prev.filter((d) => d.dramaId !== dramaId));
    } catch {
      // ignore
    }
  };

  const toggleSelect = (dramaId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dramaId)) next.delete(dramaId);
      else next.add(dramaId);
      return next;
    });
  };

  const handleBulkRemove = async () => {
    if (!token || selected.size === 0) return;
    setDeleting(true);
    try {
      await bulkRemoveHistory(token, Array.from(selected));
      setItems((prev) => prev.filter((d) => !selected.has(d.dramaId)));
      setSelected(new Set());
      setSelectMode(false);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-2 border-second border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="font-second font-semibold text-xl sm:text-3xl md:text-4xl">
          Ko&apos;rish tarixi
        </h1>
        {items.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectMode ? (
              <>
                <button
                  onClick={() => {
                    if (selected.size === items.length) setSelected(new Set());
                    else setSelected(new Set(items.map((d) => d.dramaId)));
                  }}
                  className="text-xs text-gray-400 hover:text-white transition"
                >
                  {selected.size === items.length ? "Bekor" : "Barchasi"}
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={selected.size === 0 || deleting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                >
                  <FaTrash className="text-[10px]" /> {deleting ? "..." : `O'chirish (${selected.size})`}
                </button>
                <button
                  onClick={() => { setSelectMode(false); setSelected(new Set()); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                >
                  <FaTimes className="text-[10px]" /> Bekor
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                <FaCheck className="text-[10px]" /> Tanlash
              </button>
            )}
          </div>
        )}
      </div>

      {fetching ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">📺</p>
          <h3 className="text-xl font-medium mb-2">Tarix bo&apos;sh</h3>
          <p className="text-gray-400 text-sm">Siz ko&apos;rgan dramalar bu yerda ko&apos;rinadi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${item.dramaId}-${item.episodeNumber}`}
              className="flex items-center gap-3 sm:gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-3 sm:p-4 hover:bg-white/[0.06] transition group"
            >
              {selectMode && (
                <button
                  onClick={() => toggleSelect(item.dramaId)}
                  className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    selected.has(item.dramaId)
                      ? "bg-second border-second"
                      : "border-white/30"
                  }`}
                >
                  {selected.has(item.dramaId) && <FaCheck className="text-white text-[7px]" />}
                </button>
              )}
              {item.drama?.posterUrl && (
                <Link href={`/movie/${item.dramaId}`} className="relative w-14 h-20 sm:w-16 sm:h-24 shrink-0 rounded-lg overflow-hidden">
                  <Image src={item.drama.posterUrl} alt="" fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                    <FaPlay className="text-white text-xs" />
                  </div>
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/movie/${item.dramaId}`} className="hover:text-second transition">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{item.drama?.title || "Drama"}</h3>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.episodeNumber}-qism
                  {item.completed && <span className="ml-2 text-green-400">Tugallangan</span>}
                </p>
                {/* Progress bar */}
                {!item.completed && item.positionSec > 0 && (
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-second rounded-full"
                      style={{ width: `${Math.min((item.positionSec / ((item.drama?.duration || 60) * 60)) * 100, 100)}%` }}
                    />
                  </div>
                )}
                <p className="text-[10px] text-gray-500 mt-1">
                  {new Date(item.updatedAt).toLocaleDateString("uz", { day: "numeric", month: "short" })}
                </p>
              </div>

              {/* Resume button */}
              {!item.completed && item.positionSec > 0 && !selectMode && (
                <Link
                  href={`/movie/${item.dramaId}#movie`}
                  className="shrink-0 px-3 py-1.5 bg-second/20 border border-second/20 rounded-lg text-xs text-second font-medium hover:bg-second/30 transition hidden sm:flex items-center gap-1"
                >
                  <FaPlay className="text-[8px]" /> Davom
                </Link>
              )}

              {!selectMode && (
                <button
                  onClick={() => handleRemove(item.dramaId)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                  aria-label="O'chirish"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
