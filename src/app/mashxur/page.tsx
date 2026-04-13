"use client";

import { useState, useEffect } from "react";
import { getTrendingDramas, getBestDramas, type DramaItem } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { FaFire, FaTrophy } from "react-icons/fa";

type CardItem = {
  id: string;
  title: string;
  poster: string;
  seriesNumber?: number;
  seasonNumber?: number;
  genres?: string[];
  rank?: number;
  score?: number;
  viewsCount?: number;
};

const TIME_WINDOWS = [
  { key: "7d", label: "Haftalik" },
  { key: "30d", label: "Oylik" },
  { key: "all", label: "Barcha vaqt" },
];

export default function MashxurPage() {
  const [window, setWindow] = useState("7d");
  const [tab, setTab] = useState<"trending" | "best">("trending");
  const [items, setItems] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        if (tab === "trending") {
          const data = await getTrendingDramas(window);
          setItems(
            data.items.map((d) => ({
              id: d.id,
              title: d.title,
              poster: d.posterUrl,
              seriesNumber: d.seriesNumber,
              seasonNumber: d.seasonNumber,
              genres: d.genres,
              rank: d.rank,
              score: d.score,
              viewsCount: d.viewsCount,
            }))
          );
        } else {
          const data = await getBestDramas(1, 30);
          setItems(
            data.items.map((d) => ({
              id: d.id,
              title: d.title,
              poster: d.posterUrl,
              seriesNumber: d.seriesNumber,
              seasonNumber: d.seasonNumber,
              genres: d.genres,
              rank: d.rank,
              score: d.score,
              viewsCount: d.viewsCount,
            }))
          );
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [window, tab]);

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="font-second font-semibold mb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl">
        Hozirda Mashxur
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("trending")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "trending" ? "bg-second text-white" : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <FaFire className="text-xs" /> Trending
        </button>
        <button
          onClick={() => setTab("best")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === "best" ? "bg-second text-white" : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
          }`}
        >
          <FaTrophy className="text-xs" /> Eng yaxshilar
        </button>
      </div>

      {/* Time window filter (only for trending) */}
      {tab === "trending" && (
        <div className="flex gap-2 mb-6">
          {TIME_WINDOWS.map((w) => (
            <button
              key={w.key}
              onClick={() => setWindow(w.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                window === w.key
                  ? "bg-second/20 text-second border border-second/30"
                  : "bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          variant="dramas"
          title="Hozircha mashhur dramalar yo'q"
          description="Yangi trendlar tez orada bu yerda paydo bo'ladi"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {items.map((item, idx) => (
            <div key={item.id} className="relative">
              {item.rank && (
                <div className="absolute top-2 left-2 z-10 w-7 h-7 bg-second rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  {item.rank}
                </div>
              )}
              <Card
                id={item.id}
                title={item.title}
                poster={item.poster}
                seriesNumber={item.seriesNumber}
                seasonNumber={item.seasonNumber}
                genres={item.genres}
              />
              {item.viewsCount !== undefined && (
                <p className="text-[10px] text-gray-500 mt-1 text-center">{item.viewsCount.toLocaleString()} ko&apos;rildi</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
