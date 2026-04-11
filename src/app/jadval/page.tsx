"use client";

import { useState, useEffect } from "react";
import { getSchedule, addReminder, removeReminder, type ScheduleItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import Breadcrumb from "../components/BreadCrumb";
import SafeImage from "../components/SafeImage";
import { FaBell, FaBellSlash, FaCalendarAlt, FaTag, FaBullhorn, FaPlay } from "react-icons/fa";

const TABS = [
  { key: "", label: "Barchasi", icon: FaCalendarAlt },
  { key: "drama", label: "Dramalar", icon: FaCalendarAlt },
  { key: "discount", label: "Chegirmalar", icon: FaTag },
  { key: "announcement", label: "E'lonlar", icon: FaBullhorn },
] as const;

const CATEGORY_STYLES: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  drama: { bg: "bg-second/10", border: "border-second/20", icon: "text-second", label: "Drama" },
  discount: { bg: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-400", label: "Chegirma" },
  announcement: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-400", label: "E'lon" },
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
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="font-second font-semibold mb-5 text-xl sm:text-3xl md:text-4xl">
        Jadval
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              tab === t.key
                ? "bg-second text-white"
                : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <t.icon className="text-xs" />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">📅</p>
          <h3 className="text-xl font-medium mb-2">Jadval bo&apos;sh</h3>
          <p className="text-gray-400 text-sm">Hozircha rejalashtirilgan kontentlar yo&apos;q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((item) => {
            const { day, month, time, weekday } = formatDate(item.scheduledAt);
            const upcoming = isUpcoming(item.scheduledAt);
            const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.announcement;

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  upcoming
                    ? `${style.bg} ${style.border}`
                    : "bg-white/[0.03] border-white/5 opacity-70"
                }`}
              >
                {/* Drama poster banner */}
                {item.drama?.posterUrl && (
                  <Link href={`/movie/${item.drama.id}`} className="relative block h-36 sm:h-40 overflow-hidden">
                    <SafeImage
                      src={item.drama.bannerUrl || item.drama.posterUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <FaPlay className="text-second text-sm ml-0.5" />
                      </div>
                    </div>

                    {/* Date badge on poster */}
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center min-w-[48px]">
                      <p className="text-base font-bold leading-tight">{day}</p>
                      <p className="text-[9px] text-gray-300 uppercase">{month}</p>
                    </div>

                    {/* Category badge */}
                    <div className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-md text-[10px] font-semibold ${style.bg} ${style.icon} backdrop-blur-sm border ${style.border}`}>
                      {style.label}
                    </div>
                  </Link>
                )}

                {/* No poster — show date prominently */}
                {!item.drama?.posterUrl && (
                  <div className={`relative h-24 flex items-center justify-center ${style.bg}`}>
                    <div className="text-center">
                      <p className="text-3xl font-black">{day}</p>
                      <p className="text-xs text-gray-400 uppercase">{month} · {weekday}</p>
                    </div>
                    <div className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-md text-[10px] font-semibold ${style.bg} ${style.icon} border ${style.border}`}>
                      {style.label}
                    </div>
                  </div>
                )}

                {/* Card body */}
                <div className="p-3.5 sm:p-4 space-y-2.5">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[9px]" />
                        {time}
                      </span>
                      {item.remindersCount !== undefined && item.remindersCount > 0 && (
                        <span className="flex items-center gap-1">
                          <FaBell className="text-[9px]" />
                          {item.remindersCount}
                        </span>
                      )}
                      {upcoming && (
                        <span className="px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 text-[10px] font-medium">
                          Tez kunda
                        </span>
                      )}
                    </div>

                    {token && (
                      <button
                        onClick={() => toggleReminder(item)}
                        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                          item.isReminded
                            ? "bg-second/20 text-second hover:bg-second/30"
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
  );
}
