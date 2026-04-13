"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaLock, FaCoins, FaCrown, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@/lib/auth";
import {
  saveWatchProgress,
  unlockEpisodes,
  getDramaEpisodes,
  getMe,
} from "@/lib/api";

type Episode = {
  id: string;
  episode: number;
  title: string;
  video: string;
  videoProvider?: string;
  isOpen?: boolean;
  reason?: string;
  unlockPrice?: number;
};

type Season = {
  season: number;
  episodes: Episode[];
};

type Props = {
  seasons: Season[];
  dramaId: string;
};

function mapEpisodesToSeasons(items: any[]) {
  const bySeason = new Map<number, any[]>();
  for (const ep of items) {
    const sn = ep.seasonNumber || 1;
    if (!bySeason.has(sn)) bySeason.set(sn, []);
    bySeason.get(sn)!.push(ep);
  }
  return Array.from(bySeason.entries())
    .sort(([a], [b]) => a - b)
    .map(([seasonNum, eps]) => ({
      season: seasonNum,
      episodes: eps.map((ep) => ({
        id: ep.id,
        episode: ep.episodeNumber,
        title: ep.title,
        video: ep.videoUrl || "",
        videoProvider: ep.videoProvider,
        isOpen: ep.isOpen,
        reason: ep.reason,
        unlockPrice: ep.unlockPricePerEpisode,
      })),
    }));
}

export default function EpisodePlayer({ seasons: initialSeasons, dramaId }: Props) {
  const { token, user, setUser } = useAuth();
  const [seasons, setSeasons] = useState(initialSeasons);
  const [seasonIndex, setSeasonIndex] = useState(0);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const startedAtRef = useRef<number>(0);
  const lastTrackedEpisodeRef = useRef<string | null>(null);

  // Re-fetch episodes with user token on mount so user-specific unlock state is applied.
  // Page component is a server component and can't send the token.
  useEffect(() => {
    if (!token || !dramaId) return;
    let cancelled = false;
    getDramaEpisodes(dramaId, undefined, token)
      .then((data) => {
        if (cancelled) return;
        const fresh = mapEpisodesToSeasons(data.items || []);
        if (fresh.length > 0) setSeasons(fresh);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, dramaId]);

  const currentEpisode = seasons?.[seasonIndex]?.episodes?.[episodeIndex];
  const hasMultipleSeasons = seasons.length > 1;
  const isLocked = currentEpisode ? !currentEpisode.isOpen : false;
  const price = currentEpisode?.unlockPrice ?? 0;
  const userCoins = user?.coin ?? 0;
  const hasEnoughCoins = userCoins >= price;

  // Track watch progress
  useEffect(() => {
    if (!token || !currentEpisode || !dramaId || isLocked) return;
    const key = `${dramaId}:${currentEpisode.episode}`;
    if (lastTrackedEpisodeRef.current === key) return;
    lastTrackedEpisodeRef.current = key;
    startedAtRef.current = Date.now();

    saveWatchProgress(token, {
      dramaId,
      episodeNumber: currentEpisode.episode,
      positionSec: 0,
      source: "web",
    }).catch(() => {});

    return () => {
      if (startedAtRef.current > 0) {
        const elapsed = Math.max(
          0,
          Math.floor((Date.now() - startedAtRef.current) / 1000)
        );
        if (elapsed > 5 && token) {
          saveWatchProgress(token, {
            dramaId,
            episodeNumber: currentEpisode.episode,
            positionSec: elapsed,
            watchedSec: elapsed,
            source: "web",
          }).catch(() => {});
        }
        startedAtRef.current = 0;
      }
    };
  }, [token, dramaId, currentEpisode, isLocked]);

  const handleUnlock = async () => {
    if (!token || !currentEpisode || unlocking) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      const result = await unlockEpisodes(token, dramaId, [currentEpisode.episode]);

      // Optimistic: update coin balance immediately
      if (user && typeof result.remainingCoins === "number") {
        setUser({ ...user, coin: result.remainingCoins });
      }

      // Authoritative: fetch fresh user from backend (persists to localStorage too)
      getMe(token)
        .then((profile) => setUser(profile))
        .catch(() => {});

      // Re-fetch episodes from backend to get fresh access state & video URL
      try {
        const fresh = await getDramaEpisodes(dramaId, undefined, token);
        const freshSeasons = mapEpisodesToSeasons(fresh.items || []);
        if (freshSeasons.length > 0) setSeasons(freshSeasons);
      } catch {
        // Fallback: locally mark episode as unlocked
        setSeasons((prev) =>
          prev.map((s, si) =>
            si === seasonIndex
              ? {
                  ...s,
                  episodes: s.episodes.map((ep, ei) =>
                    ei === episodeIndex
                      ? { ...ep, isOpen: true, reason: "UNLOCKED" }
                      : ep
                  ),
                }
              : s
          )
        );
      }
    } catch (err: any) {
      if (err?.status === 400 || err?.message?.toLowerCase().includes("coin")) {
        setUnlockError("Coin balansingiz yetarli emas");
      } else if (err?.status === 401) {
        setUnlockError("Avval tizimga kiring");
      } else {
        setUnlockError("Ochilmadi. Keyinroq urinib ko'ring.");
      }
    } finally {
      setUnlocking(false);
    }
  };

  if (!currentEpisode) return null;

  return (
    <div className="w-full" id="movie">
      {/* Video area */}
      <div className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/5">
        {isLocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-main/95 to-black z-10 p-4 sm:p-6 text-center overflow-y-auto">
            <div className="relative mb-4 sm:mb-5">
              <div className="absolute inset-0 rounded-full bg-second/20 blur-2xl scale-150" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.06] border border-second/30 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <FaLock className="text-second text-xl sm:text-2xl" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2 text-white">
              {currentEpisode.episode}-qism qulflangan
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-4 sm:mb-5 leading-relaxed">
              Premium obuna bo&apos;ling yoki coin bilan bu qismni oching
            </p>

            {/* Price card */}
            {price > 0 && (
              <div className="mb-5 sm:mb-6 inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 bg-white/[0.04] border border-second/25 rounded-xl sm:rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-second/15 border border-second/25 flex items-center justify-center">
                    <FaCoins className="text-second text-sm sm:text-base" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                      Narxi
                    </p>
                    <p className="text-base sm:text-lg font-black text-white">
                      {price} <span className="text-[11px] sm:text-xs font-semibold text-gray-400">coin</span>
                    </p>
                  </div>
                </div>
                <div className="h-8 sm:h-10 w-px bg-white/10" />
                <div className="text-left">
                  <p className="text-[10px] sm:text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                    Sizda
                  </p>
                  <p
                    className={`text-base sm:text-lg font-black ${hasEnoughCoins ? "text-white" : "text-red-400"}`}
                  >
                    {userCoins} <span className="text-[11px] sm:text-xs font-semibold text-gray-400">coin</span>
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {unlockError && (
              <p className="mb-4 text-xs sm:text-sm text-red-400 font-semibold">
                {unlockError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              {token && price > 0 && (
                hasEnoughCoins ? (
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-second text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-second/85 transition-all duration-300 active:scale-95 shadow-[0_8px_30px_rgba(126,84,230,0.35)] disabled:opacity-60"
                  >
                    {unlocking ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Ochilmoqda...
                      </>
                    ) : (
                      <>
                        <FaCoins className="text-xs sm:text-sm" />
                        Coin bilan ochish
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/coin"
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-second text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-second/85 transition-all duration-300 active:scale-95 shadow-[0_8px_30px_rgba(126,84,230,0.35)]"
                  >
                    <FaCoins className="text-xs sm:text-sm" />
                    Coin to&apos;ldirish
                  </Link>
                )
              )}
              <Link
                href="/obuna"
                className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 active:scale-95 ${
                  !token || price === 0
                    ? "bg-second text-white hover:bg-second/85 shadow-[0_8px_30px_rgba(126,84,230,0.35)]"
                    : "bg-white/[0.06] border border-white/15 text-white hover:bg-white/[0.1] hover:border-second/30"
                }`}
              >
                <FaCrown className="text-xs sm:text-sm" />
                Premium olish
              </Link>
              {!token && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/[0.06] border border-white/15 text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-white/[0.1] hover:border-second/30 transition-all duration-300 active:scale-95"
                >
                  Kirish
                </Link>
              )}
            </div>
          </div>
        ) : currentEpisode.video ? (
          <iframe
            src={currentEpisode.video}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Video mavjud emas
          </div>
        )}
      </div>

      {/* Episode selector */}
      <div className="mt-4 sm:mt-5">
        {hasMultipleSeasons && (
          <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-4 sm:mb-5">
            {seasons.map((s, i) => (
              <button
                key={s.season}
                onClick={() => {
                  setSeasonIndex(i);
                  setEpisodeIndex(0);
                  setUnlockError(null);
                }}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300
                ${
                  i === seasonIndex
                    ? "bg-second text-white shadow-[0_4px_15px_rgba(126,84,230,0.3)]"
                    : "bg-white/5 border border-white/5 text-white hover:bg-second/20 hover:border-second/20"
                }`}
              >
                {s.season}-Fasl
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {seasons?.[seasonIndex]?.episodes?.map((ep, i) => (
            <button
              key={ep.id}
              onClick={() => {
                setEpisodeIndex(i);
                setUnlockError(null);
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1.5
              ${
                episodeIndex === i
                  ? "bg-second text-white shadow-[0_4px_15px_rgba(126,84,230,0.3)]"
                  : !ep.isOpen
                    ? "bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                    : "bg-white/5 border border-white/5 text-white hover:bg-second/20 hover:border-second/20"
              }`}
            >
              {ep.isOpen ? (
                ep.reason === "UNLOCKED" ? (
                  <FaCheckCircle className="text-[8px] text-second" />
                ) : null
              ) : (
                <FaLock className="text-[8px]" />
              )}
              {ep.episode}-qism
              {!ep.isOpen && ep.unlockPrice ? (
                <span className="ml-0.5 inline-flex items-center gap-0.5 text-[9px] opacity-80">
                  · <FaCoins className="text-second" /> {ep.unlockPrice}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
