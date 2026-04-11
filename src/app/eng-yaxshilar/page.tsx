"use client";

import { useState, useEffect } from "react";
import { getBestDramas, type DramaItem } from "@/lib/api";
import Card from "../components/Card";
import Breadcrumb from "../components/BreadCrumb";
import { FaTrophy, FaMedal } from "react-icons/fa";

export default function BestDramasPage() {
  const [items, setItems] = useState<DramaItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const data = await getBestDramas(p, 30);
      if (p === 1) {
        setItems(data.items);
      } else {
        setItems((prev) => [...prev, ...data.items]);
      }
      setHasMore(data.items.length === 30);
      setPage(p);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const badgeColor = (badge?: string) => {
    if (badge === "gold") return "text-yellow-400";
    if (badge === "silver") return "text-gray-300";
    if (badge === "bronze") return "text-orange-400";
    return "text-second";
  };

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="font-second font-semibold mb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl">
        <FaTrophy className="text-yellow-400" /> Eng yaxshi dramalar
      </h1>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-gray-400">Hech narsa topilmadi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {items.map((item) => (
              <div key={item.id} className="relative">
                {item.rank && (
                  <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full ${badgeColor(item.badge)}`}>
                    {item.rank <= 3 ? <FaMedal className="text-xs" /> : <span className="text-xs font-bold">#{item.rank}</span>}
                    {item.rank <= 3 && <span className="text-xs font-bold">{item.rank}</span>}
                  </div>
                )}
                <Card
                  id={item.id}
                  title={item.title}
                  poster={item.posterUrl}
                  seriesNumber={item.seriesNumber}
                  seasonNumber={item.seasonNumber}
                  genres={item.genres}
                />
                {item.score !== undefined && (
                  <p className="text-[10px] text-gray-500 mt-1 text-center">Score: {item.score.toFixed(1)}</p>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchData(page + 1)}
                disabled={loading}
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
              >
                {loading ? "Yuklanmoqda..." : "Ko'proq ko'rsatish"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
