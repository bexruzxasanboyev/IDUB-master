"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { FaLock, FaCoins } from "react-icons/fa";
import { useAuth } from "@/lib/auth";
import { getPlaybackUrl, unlockEpisodes, saveWatchProgress, startWatchSession, updateWatchSession, endWatchSession } from "@/lib/api";

type Episode = {
  id: string;
  episode: number;
  title: string;
  video: string;
  poster?: string;
  isFree?: boolean;
  isUnlocked?: boolean;
};

type Season = {
  season: number;
  episodes: Episode[];
};

type Props = {
  seasons: Season[];
  dramaId?: string;
};

export default function Player({ seasons, dramaId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { token } = useAuth();

  const [seasonIndex, setSeasonIndex] = useState(0);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [localSeasons, setLocalSeasons] = useState(seasons);
  const sessionIdRef = useRef<string | null>(null);
  const lastSaveRef = useRef<number>(0);

  const currentEpisode = localSeasons?.[seasonIndex]?.episodes?.[episodeIndex];
  const isLocked = currentEpisode && !currentEpisode.isFree && !currentEpisode.isUnlocked && !currentEpisode.video;

  useEffect(() => {
    if (!currentEpisode) return;

    if (isLocked) {
      setVideoSrc("");
      return;
    }

    if (currentEpisode.video) {
      setVideoSrc(currentEpisode.video);
      return;
    }

    if (token && currentEpisode.id) {
      setLoadingVideo(true);
      getPlaybackUrl(token, currentEpisode.id)
        .then((data) => setVideoSrc(data.url))
        .catch(() => setVideoSrc(""))
        .finally(() => setLoadingVideo(false));
    }
  }, [currentEpisode, token, isLocked]);

  const handleUnlock = async () => {
    if (!token || !dramaId || !currentEpisode || unlocking) return;
    setUnlocking(true);
    try {
      const result = await unlockEpisodes(token, dramaId, [currentEpisode.episode]);
      if (result.unlockedEpisodeNumbers.includes(currentEpisode.episode)) {
        setLocalSeasons((prev) =>
          prev.map((s, si) =>
            si === seasonIndex
              ? {
                  ...s,
                  episodes: s.episodes.map((ep, ei) =>
                    ei === episodeIndex ? { ...ep, isUnlocked: true } : ep
                  ),
                }
              : s
          )
        );
        if (currentEpisode.id) {
          const data = await getPlaybackUrl(token, currentEpisode.id);
          setVideoSrc(data.url);
        }
      }
    } catch {
      // insufficient coins or error
    } finally {
      setUnlocking(false);
    }
  };

  const saveProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !token || !dramaId || !currentEpisode) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 15000) return;
    lastSaveRef.current = now;

    saveWatchProgress(token, {
      dramaId,
      episodeNumber: currentEpisode.episode,
      positionSec: Math.floor(video.currentTime),
      completed: video.duration > 0 && video.currentTime / video.duration > 0.9,
      watchedSec: Math.floor(video.currentTime),
    }).catch(() => {});

    if (sessionIdRef.current) {
      updateWatchSession(token, {
        sessionId: sessionIdRef.current,
        endPosSec: Math.floor(video.currentTime),
        durationSec: Math.floor(video.currentTime),
      }).catch(() => {});
    }
  }, [token, dramaId, currentEpisode]);

  useEffect(() => {
    if (!token || !dramaId || !currentEpisode || isLocked) return;

    startWatchSession(token, {
      dramaId,
      episodeNumber: currentEpisode.episode,
      startPosSec: 0,
    })
      .then((data) => { sessionIdRef.current = data.sessionId; })
      .catch(() => {});

    return () => {
      if (sessionIdRef.current && token) {
        const video = videoRef.current;
        endWatchSession(token, {
          sessionId: sessionIdRef.current,
          endPosSec: video ? Math.floor(video.currentTime) : 0,
          durationSec: video ? Math.floor(video.currentTime) : 0,
          completed: video ? video.duration > 0 && video.currentTime / video.duration > 0.9 : false,
        }).catch(() => {});
        sessionIdRef.current = null;
      }
    };
  }, [token, dramaId, currentEpisode?.id, isLocked]);

  const hasMultipleSeasons = localSeasons.length > 1;

  if (!currentEpisode) return null;

  return (
    <div className="w-full bg-black" id="movie">
      {/* Video area */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        {isLocked ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
            <FaLock className="text-4xl text-gray-500 mb-4" />
            <p className="text-lg font-bold mb-2 text-white">Bu qism qulflangan</p>
            <p className="text-sm text-gray-400 mb-4">Coin sarflab ochishingiz mumkin</p>
            {token ? (
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="px-6 py-3 bg-second rounded-xl font-bold flex items-center gap-2 hover:bg-second/85 transition disabled:opacity-50 text-white"
              >
                <FaCoins className="text-yellow-400" />
                {unlocking ? "Ochilmoqda..." : "Coin bilan ochish"}
              </button>
            ) : (
              <a href="/login" className="px-6 py-3 bg-second rounded-xl font-bold hover:bg-second/85 transition text-white">
                Kirish
              </a>
            )}
          </div>
        ) : loadingVideo ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-second border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <video
            poster={currentEpisode.poster}
            key={currentEpisode.id + videoSrc}
            ref={videoRef}
            src={videoSrc || currentEpisode.video}
            className="w-full h-full"
            onTimeUpdate={saveProgress}
            playsInline
            controls
          />
        )}
      </div>

      {/* Episodes */}
      <div className="p-3 sm:p-4 md:p-5 bg-white/[0.03] border-t border-white/5">
        {hasMultipleSeasons && (
          <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-4 sm:mb-5">
            {localSeasons.map((s, i) => (
              <button
                key={s.season}
                onClick={() => {
                  setSeasonIndex(i);
                  setEpisodeIndex(0);
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
          {localSeasons?.[seasonIndex]?.episodes?.map((ep, i) => {
            const locked = !ep.isFree && !ep.isUnlocked && !ep.video;
            return (
              <button
                key={ep.id}
                onClick={() => setEpisodeIndex(i)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1
                ${
                  episodeIndex === i
                    ? "bg-second text-white shadow-[0_4px_15px_rgba(126,84,230,0.3)]"
                    : locked
                      ? "bg-white/5 border border-white/5 text-gray-500"
                      : "bg-white/5 border border-white/5 text-white hover:bg-second/20 hover:border-second/20"
                }`}
              >
                {locked && <FaLock className="text-[8px]" />}
                {ep.episode}-qism
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
