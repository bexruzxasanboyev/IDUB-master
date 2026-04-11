"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getRandomDramas, getRecommendation, type DramaItem } from "@/lib/api";
import Card from "../components/Card";
import Breadcrumb from "../components/BreadCrumb";
import Image from "next/image";
import Link from "next/link";
import { FaPlay, FaStar, FaSyncAlt } from "react-icons/fa";

export default function RecommendationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [topRec, setTopRec] = useState<DramaItem | null>(null);
  const [items, setItems] = useState<DramaItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [seed, setSeed] = useState<number | undefined>();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const fetchData = async () => {
    if (!token) return;
    setFetching(true);
    try {
      const [recData, randomData] = await Promise.all([
        getRecommendation(token).catch(() => null),
        getRandomDramas(token, 1, 20, seed),
      ]);
      if (recData) setTopRec(recData.drama);
      setItems(randomData.items);
      setSeed(randomData.seed);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const refresh = () => {
    setSeed(undefined);
    fetchData();
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <span className="w-1 h-6 bg-second rounded-full" />
          Siz uchun tavsiyalar
        </h1>
        <button
          onClick={refresh}
          disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition disabled:opacity-50"
        >
          <FaSyncAlt className={`text-xs ${fetching ? "animate-spin" : ""}`} />
          Yangilash
        </button>
      </div>

      {/* Top recommendation */}
      {topRec && (
        <div className="relative rounded-2xl overflow-hidden mb-8 border border-white/5">
          <div className="relative h-48 sm:h-64 md:h-80">
            <Image
              src={topRec.bannerUrl || topRec.posterUrl}
              alt={topRec.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-main/80 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 p-5 sm:p-8">
            <p className="text-xs text-second font-semibold mb-1 uppercase tracking-wider">Sizga maxsus tavsiya</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{topRec.title}</h2>
            {topRec.description && (
              <p className="text-gray-400 text-sm line-clamp-2 max-w-xl mb-3">{topRec.description}</p>
            )}
            <div className="flex items-center gap-3">
              <Link
                href={`/movie/${topRec.id}`}
                className="px-5 py-2.5 bg-second text-white rounded-lg font-bold flex items-center gap-2 hover:bg-second/85 transition text-sm"
              >
                <FaPlay className="text-xs" /> Ko&apos;rish
              </Link>
              {topRec.imdbRating && (
                <span className="flex items-center gap-1 text-sm text-yellow-400">
                  <FaStar className="text-xs" /> {topRec.imdbRating}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Random recommendations */}
      {fetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-gray-400">Tavsiyalar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((d) => (
            <Card
              key={d.id}
              id={d.id}
              title={d.title}
              poster={d.posterUrl}
              seriesNumber={d.seriesNumber}
              seasonNumber={d.seasonNumber}
              genres={d.genres}
            />
          ))}
        </div>
      )}
    </div>
  );
}
