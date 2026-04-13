"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getHistory, bulkRemoveHistory, normalizeImageUrl, type HistoryItem } from "@/lib/api";
import { formatRelativeDate, formatDateTime } from "@/lib/date-format";
import Link from "next/link";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";
import SafeImage from "../components/SafeImage";
import {
  Play,
  Trash2,
  Check,
  X,
  Clock,
  CheckCircle2,
  ListFilter,
} from "lucide-react";

type FilterMode = "all" | "progress" | "completed";

function groupByDate(items: HistoryItem[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, HistoryItem[]> = {
    Bugun: [],
    Kecha: [],
    "Shu hafta": [],
    Avvalroq: [],
  };

  items.forEach((item) => {
    const raw = item.lastWatchedAt;
    const date = raw ? new Date(raw) : null;
    if (!date || isNaN(date.getTime())) {
      groups["Avvalroq"].push(item);
      return;
    }
    if (date >= today) groups["Bugun"].push(item);
    else if (date >= yesterday) groups["Kecha"].push(item);
    else if (date >= weekAgo) groups["Shu hafta"].push(item);
    else groups["Avvalroq"].push(item);
  });

  return Object.entries(groups).filter(([, list]) => list.length > 0);
}

function formatTime(sec: number) {
  if (!sec) return "0:00";
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}s ${mins}d`;
  }
  return `${minutes}d ${seconds.toString().padStart(2, "0")}s`;
}

export default function TarixPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    getHistory(token)
      .then((data) => setItems(data.items))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const filteredItems = useMemo(() => {
    if (filter === "progress")
      return items.filter((i) => !i.isCompleted && i.lastPositionSec > 0);
    if (filter === "completed") return items.filter((i) => i.isCompleted);
    return items;
  }, [items, filter]);

  const grouped = useMemo(() => groupByDate(filteredItems), [filteredItems]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.isCompleted).length;
    const inProgress = items.filter(
      (i) => !i.isCompleted && i.lastPositionSec > 0
    ).length;
    return { total, completed, inProgress };
  }, [items]);

  const handleRemove = async (dramaId: string) => {
    if (!token) return;
    setItems((prev) => prev.filter((d) => d.dramaId !== dramaId));
    try {
      await bulkRemoveHistory(token, [dramaId]);
    } catch {
      // ignore
    }
  };

  const toggleSelect = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleBulkRemove = async () => {
    if (!token || selected.size === 0) return;
    setDeleting(true);
    try {
      const ids = Array.from(selected);
      await bulkRemoveHistory(token, ids);
      setItems((prev) => prev.filter((d) => !selected.has(d.dramaId)));
      setSelected(new Set());
      setSelectMode(false);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-main text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-14">
          <div className="h-6 w-32 rounded skeleton mb-4" />
          <div className="h-10 w-56 rounded-xl skeleton mb-6" />
          <div className="flex gap-3 mb-8">
            <div className="h-24 flex-1 rounded-2xl skeleton" />
            <div className="h-24 flex-1 rounded-2xl skeleton" />
            <div className="h-24 flex-1 rounded-2xl skeleton" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl sm:rounded-2xl skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-main text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] overflow-hidden">
        <div className="absolute left-1/2 -top-32 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(126,84,230,0.08),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20">
        <Breadcrumb />

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 flex-wrap">
          <div>
            <h1 className="font-second font-semibold text-2xl sm:text-3xl md:text-4xl flex items-center gap-2 sm:gap-3">
              <span className="w-1 h-6 sm:h-7 bg-second rounded-full" />
              Ko&apos;rish tarixi
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 ml-4 sm:ml-6">
              Davom ettiring yoki yangilaringizni kashf eting
            </p>
          </div>

          {/* Actions */}
          {items.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {selectMode ? (
                <>
                  <button
                    onClick={() => {
                      if (selected.size === filteredItems.length) {
                        setSelected(new Set());
                      } else {
                        setSelected(new Set(filteredItems.map((d) => d.dramaId)));
                      }
                    }}
                    className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-white transition"
                  >
                    {selected.size === filteredItems.length ? "Bekor" : "Barchasini tanlash"}
                  </button>
                  <button
                    onClick={handleBulkRemove}
                    disabled={selected.size === 0 || deleting}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 border border-red-500/25 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    {deleting ? "O'chirilmoqda..." : `O'chirish (${selected.size})`}
                  </button>
                  <button
                    onClick={exitSelectMode}
                    className="w-9 h-9 flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition"
                    aria-label="Bekor"
                  >
                    <X size={15} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/[0.08] hover:border-second/30 transition"
                >
                  <Check size={13} />
                  Tanlash
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats cards */}
        {items.length > 0 && !fetching && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`text-left p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                filter === "all"
                  ? "bg-second/10 border-second/30"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase font-bold tracking-wider text-gray-500 mb-1 sm:mb-2">
                <ListFilter size={12} className={filter === "all" ? "text-second" : ""} />
                <span className="hidden sm:inline">Jami</span>
                <span className="sm:hidden">Jami</span>
              </div>
              <p className="text-xl sm:text-3xl font-black">{stats.total}</p>
            </button>

            <button
              onClick={() => setFilter("progress")}
              className={`text-left p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                filter === "progress"
                  ? "bg-second/10 border-second/30"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase font-bold tracking-wider text-gray-500 mb-1 sm:mb-2">
                <Clock size={12} className={filter === "progress" ? "text-second" : ""} />
                <span className="hidden sm:inline">Davom etmoqda</span>
                <span className="sm:hidden">Davomli</span>
              </div>
              <p className="text-xl sm:text-3xl font-black">{stats.inProgress}</p>
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`text-left p-3 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                filter === "completed"
                  ? "bg-second/10 border-second/30"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase font-bold tracking-wider text-gray-500 mb-1 sm:mb-2">
                <CheckCircle2 size={12} className={filter === "completed" ? "text-second" : ""} />
                Tugallangan
              </div>
              <p className="text-xl sm:text-3xl font-black">{stats.completed}</p>
            </button>
          </div>
        )}

        {/* Content */}
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-video rounded-xl sm:rounded-2xl skeleton" />
                <div className="h-4 w-4/5 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            variant="history"
            title={
              filter === "progress"
                ? "Davom etayotgan narsa yo'q"
                : filter === "completed"
                  ? "Hali tugallangan drama yo'q"
                  : "Tarix bo'sh"
            }
            description={
              filter !== "all"
                ? "Boshqa filtrni tanlab ko'ring"
                : "Siz ko'rgan dramalar bu yerda ko'rinadi. Istalgan paytda davom ettirishingiz mumkin."
            }
            action={
              filter !== "all" ? (
                <button
                  onClick={() => setFilter("all")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-second rounded-lg text-sm font-medium text-white hover:bg-second/85 transition active:scale-95"
                >
                  Barchasini ko&apos;rish
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {grouped.map(([groupTitle, list]) => (
              <section key={groupTitle}>
                <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                  <div className="w-1 h-4 sm:h-5 bg-second/60 rounded-full" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400">
                    {groupTitle}
                  </h2>
                  <span className="text-[10px] sm:text-xs text-gray-600 font-medium">
                    {list.length} ta
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {list.map((item) => {
                    const poster = item.drama?.bannerUrl || item.drama?.posterUrl;
                    const progress = item.isCompleted
                      ? 100
                      : item.drama?.duration
                        ? Math.min(
                            (item.lastPositionSec / (item.drama.duration * 60)) * 100,
                            100
                          )
                        : item.lastPositionSec > 0
                          ? 30
                          : 0;
                    const isSelected = selected.has(item.dramaId);
                    const relativeDate = formatRelativeDate(item.lastWatchedAt);
                    const fullDateTitle = formatDateTime(item.lastWatchedAt);

                    return (
                      <article
                        key={`${item.dramaId}-${item.lastEpisodeNumber}`}
                        className={`group relative bg-white/[0.02] border rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? "border-second ring-2 ring-second/30"
                            : "border-white/5 hover:border-second/30 hover:bg-white/[0.04]"
                        }`}
                      >
                        {/* Thumbnail area */}
                        <div className="relative aspect-video overflow-hidden">
                          {poster ? (
                            <Link
                              href={
                                selectMode
                                  ? "#"
                                  : `/movie/${item.dramaId}${!item.isCompleted && item.lastPositionSec > 0 ? "#movie" : ""}`
                              }
                              onClick={(e) => {
                                if (selectMode) {
                                  e.preventDefault();
                                  toggleSelect(item.dramaId);
                                }
                              }}
                              className="block relative w-full h-full"
                            >
                              <SafeImage
                                src={normalizeImageUrl(poster)}
                                alt={item.drama?.title || "Drama"}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                fallbackText={item.drama?.title?.charAt(0)}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                              {/* Play button on hover */}
                              {!selectMode && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-second/90 backdrop-blur-sm flex items-center justify-center shadow-[0_8px_30px_rgba(126,84,230,0.4)] scale-75 group-hover:scale-100 transition-transform duration-300">
                                    <Play
                                      size={20}
                                      className="text-white ml-1"
                                      fill="currentColor"
                                    />
                                  </div>
                                </div>
                              )}
                            </Link>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-surface to-black flex items-center justify-center">
                              <Play size={32} className="text-white/20" />
                            </div>
                          )}

                          {/* Top-left: select checkbox / episode badge */}
                          <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-10">
                            {selectMode ? (
                              <button
                                onClick={() => toggleSelect(item.dramaId)}
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                                  isSelected
                                    ? "bg-second border-second"
                                    : "bg-black/50 backdrop-blur-md border-white/40 hover:border-white"
                                }`}
                              >
                                {isSelected && (
                                  <Check size={14} className="text-white" strokeWidth={3} />
                                )}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] sm:text-[11px] font-bold text-white">
                                {item.lastEpisodeNumber}-qism
                                {item.drama?.totalEpisodes
                                  ? ` / ${item.drama.totalEpisodes}`
                                  : ""}
                              </span>
                            )}
                          </div>

                          {/* Top-right: completed badge / remove button */}
                          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-10 flex items-center gap-1.5">
                            {item.isCompleted && !selectMode && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-second/80 backdrop-blur-md rounded-md text-[10px] font-bold text-white">
                                <CheckCircle2 size={11} />
                                Tugallangan
                              </span>
                            )}
                            {!selectMode && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemove(item.dramaId);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:border-red-400/40 transition opacity-0 group-hover:opacity-100"
                                aria-label="O'chirish"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {/* Bottom: progress bar */}
                          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40">
                            <div
                              className="h-full bg-second transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Info */}
                        <Link
                          href={
                            selectMode
                              ? "#"
                              : `/movie/${item.dramaId}${!item.isCompleted && item.lastPositionSec > 0 ? "#movie" : ""}`
                          }
                          onClick={(e) => {
                            if (selectMode) {
                              e.preventDefault();
                              toggleSelect(item.dramaId);
                            }
                          }}
                          className="block p-3 sm:p-4"
                        >
                          <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-second transition-colors duration-300">
                            {item.drama?.title || "Drama"}
                          </h3>
                          <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                              {item.isCompleted ? (
                                <>
                                  <CheckCircle2 size={11} className="text-second" />
                                  Tugatildi
                                </>
                              ) : (
                                <>
                                  <Clock size={11} className="text-second" />
                                  {item.lastEpisodeNumber}-qism
                                  {item.lastPositionSec > 0
                                    ? ` · ${formatTime(item.lastPositionSec)}`
                                    : ""}
                                </>
                              )}
                            </span>
                            {relativeDate && (
                              <span className="text-gray-600" title={fullDateTitle}>
                                {relativeDate}
                              </span>
                            )}
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
