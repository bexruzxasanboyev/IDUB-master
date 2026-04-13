"use client";

import { useState, useEffect } from "react";
import { getSchedule, addReminder, removeReminder, type ScheduleItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";
import SafeImage from "../components/SafeImage";
import { FaBell, FaBellSlash, FaCalendarAlt, FaTag, FaBullhorn, FaPlay, FaClock } from "react-icons/fa";

const TABS = [
  { key: "", label: "Barchasi", icon: FaCalendarAlt },
  { key: "drama", label: "Dramalar", icon: FaPlay },
  { key: "discount", label: "Chegirmalar", icon: FaTag },
  { key: "announcement", label: "E'lonlar", icon: FaBullhorn },
] as const;

const CATEGORY_STYLES: Record<string, { bg: string; border: string; icon: string; label: string; glow: string }> = {
  drama: { bg: "bg-second/10", border: "border-second/20", icon: "text-second", label: "Drama", glow: "shadow-second/10" },
  discount: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", label: "Chegirma", glow: "shadow-emerald-500/10" },
  announcement: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", label: "E'lon", glow: "shadow-amber-500/10" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleDateString("uz", { month: "short" });
  const time = date.toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" });
  const weekday = date.toLocaleDateString("uz", { weekday: "short" });
  return { day, month, time, weekday };
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) > new Date();
}

export default function JadvalPage() {
  const { token } = useAuth();
  const [tab, setTab] = useState("");
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSchedule(tab || undefined)
      .then((data) => setItems(data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const toggleReminder = async (item: ScheduleItem) => {
    if (!token) return;
    try {
      if (item.isReminded) {
        await removeReminder(token, item.id);
      } else {
        await addReminder(token, item.id);
      }
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isReminded: !i.isReminded } : i))
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-main">
      {/* Header Area */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-second/8 to-transparent h-64" />
        <div className="container relative pt-24 sm:pt-28 md:pt-30 pb-2 text-white">
          <Breadcrumb />
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="font-second font-bold text-2xl sm:text-3xl md:text-4xl mb-2">
                Jadval
              </h1>
              <p className="text-sm text-gray-400">Yangi qismlar va e&apos;lonlar jadvali</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  tab === t.key
                    ? "bg-second text-white shadow-lg shadow-second/25"
                    : "bg-surface border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/10"
                }`}
              >
                <t.icon className="text-xs" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container pb-10 text-white">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 skeleton rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            variant="schedule"
            title="Jadval bo'sh"
            description="Hozircha rejalashtirilgan premyeralar yo'q. Tez orada yangiliklar bo'ladi!"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const { day, month, time, weekday } = formatDate(item.scheduledAt);
              const upcoming = isUpcoming(item.scheduledAt);
              const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.announcement;

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.glow} ${
                    upcoming
                      ? `bg-surface/80 ${style.border}`
                      : "bg-surface/40 border-white/5 opacity-60"
                  }`}
                >
                  {/* Poster/Banner area */}
                  {item.drama?.posterUrl ? (
                    <Link href={`/movie/${item.drama.id}`} className="relative block h-44 overflow-hidden">
                      <SafeImage
                        src={item.drama.bannerUrl || item.drama.posterUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/30 to-transparent" />

                      {/* Play hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl backdrop-blur-sm">
                          <FaPlay className="text-second text-sm ml-0.5" />
                        </div>
                      </div>

                      {/* Date badge */}
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 text-center min-w-[52px] border border-white/10">
                        <p className="text-lg font-black leading-tight">{day}</p>
                        <p className="text-[10px] text-gray-300 uppercase font-medium">{month}</p>
                      </div>

                      {/* Category */}
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold ${style.bg} ${style.icon} backdrop-blur-md border ${style.border}`}>
                        {style.label}
                      </div>
                    </Link>
                  ) : (
                    <div className={`relative h-32 flex items-center justify-center ${style.bg}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                      <div className="text-center relative">
                        <p className="text-4xl font-black">{day}</p>
                        <p className="text-xs text-gray-400 uppercase font-medium">{month} · {weekday}</p>
                      </div>
                      <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold ${style.bg} ${style.icon} border ${style.border}`}>
                        {style.label}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-base line-clamp-1 group-hover:text-white transition-colors">{item.title}</h3>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <FaClock className="text-[9px]" />
                          {time}
                        </span>
                        {item.remindersCount !== undefined && item.remindersCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <FaBell className="text-[9px]" />
                            {item.remindersCount}
                          </span>
                        )}
                        {upcoming && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold border border-emerald-500/10">
                            Tez kunda
                          </span>
                        )}
                      </div>

                      {token && (
                        <button
                          onClick={() => toggleReminder(item)}
                          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                            item.isReminded
                              ? "bg-second/20 text-second hover:bg-second/30 shadow-sm shadow-second/10"
                              : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                          }`}
                          aria-label="Eslatma"
                        >
                          {item.isReminded ? <FaBell className="text-xs" /> : <FaBellSlash className="text-xs" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
