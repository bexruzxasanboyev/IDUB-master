"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getGenres,
  getDramas,
  normalizeImageUrl,
  type Genre,
  type DramaItem,
} from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";
import SafeImage from "../components/SafeImage";
import { Film, Flame, ArrowRight } from "lucide-react";

type GenreWithDrama = Genre & {
  topDrama?: DramaItem;
  loaded?: boolean;
};

export default function GenresPage() {
  const [genres, setGenres] = useState<GenreWithDrama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { genres: list } = await getGenres();
        if (cancelled) return;
        setGenres(list.map((g) => ({ ...g, loaded: false })));

        // Fetch top drama for each genre in parallel
        const withPosters = await Promise.all(
          list.map(async (g) => {
            try {
              const data = await getDramas({
                genre: g.slug,
                sort: "popular",
                limit: 1,
              });
              return {
                ...g,
                topDrama: data.items[0],
                loaded: true,
              };
            } catch {
              return { ...g, loaded: true };
            }
          })
        );
        if (cancelled) return;
        setGenres(withPosters);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-main text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[500px] overflow-hidden">
        <div className="absolute left-1/2 -top-32 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(126,84,230,0.1),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20">
        <Breadcrumb />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 md:mb-10 flex-wrap">
          <h1 className="font-second font-semibold text-2xl sm:text-3xl md:text-4xl flex items-center gap-2 sm:gap-3">
            <span className="w-1 h-6 sm:h-7 bg-second rounded-full" />
            Barcha janrlar
          </h1>
          {!loading && genres.length > 0 && (
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              {genres.length} ta
            </span>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/9] rounded-2xl sm:rounded-3xl skeleton"
              />
            ))}
          </div>
        ) : genres.length === 0 ? (
          <EmptyState
            variant="catalog"
            title="Janrlar topilmadi"
            description="Hozircha janrlar ro'yxati mavjud emas"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/hammasi?genre=${genre.slug}`}
                className="group relative block aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-second/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(126,84,230,0.2),0_8px_30px_rgba(0,0,0,0.4)]"
              >
                {/* Background banner */}
                {genre.topDrama?.bannerUrl || genre.topDrama?.posterUrl ? (
                  <>
                    <SafeImage
                      src={normalizeImageUrl(
                        genre.topDrama.bannerUrl || genre.topDrama.posterUrl
                      )}
                      alt={genre.title}
                      fill
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      fallbackText={genre.title.charAt(0)}
                    />
                    {/* Layered gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-second/5 via-transparent to-second/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface via-main to-black flex items-center justify-center">
                    <Film className="text-white/10" size={64} />
                  </div>
                )}

                {/* Top badge */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-start justify-between z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-semibold text-white/80 uppercase tracking-wider">
                    <Flame size={11} className="text-second" />
                    Janr
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-400">
                    <ArrowRight
                      size={15}
                      className="text-white group-hover:text-second transition-colors"
                    />
                  </div>
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white group-hover:text-second transition-colors duration-300 leading-[1.05] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {genre.title}
                  </h3>
                  {genre.topDrama?.title && (
                    <p className="mt-2 text-xs sm:text-sm text-gray-200/90 line-clamp-1 font-medium flex items-center gap-2">
                      <Flame size={11} className="text-second shrink-0" />
                      <span className="text-gray-400">Top:</span>
                      <span className="text-white/90">{genre.topDrama.title}</span>
                    </p>
                  )}
                </div>

                {/* Hover highlight border */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl ring-0 group-hover:ring-1 ring-second/40 transition-all duration-500" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
