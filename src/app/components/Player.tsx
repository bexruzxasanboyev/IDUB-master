"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaLock,
  FaCoins,
} from "react-icons/fa";
import { MdForward10, MdReplay10 } from "react-icons/md";
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
  const playerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { token } = useAuth();

  const [seasonIndex, setSeasonIndex] = useState(0);
  const [episodeIndex, setEpisodeIndex] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [controls, setControls] = useState(true);
  const [skipAnim, setSkipAnim] = useState<null | "forward" | "back">(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [localSeasons, setLocalSeasons] = useState(seasons);
  const sessionIdRef = useRef<string | null>(null);
  const lastSaveRef = useRef<number>(0);

  const currentEpisode = localSeasons?.[seasonIndex]?.episodes?.[episodeIndex];
  const isLocked = currentEpisode && !currentEpisode.isFree && !currentEpisode.isUnlocked && !currentEpisode.video;

  // Fetch playback URL when episode changes
  useEffect(() => {
    if (!currentEpisode) return;

    if (isLocked) {
      setVideoSrc("");
      return;
    }

    // If episode already has a direct video URL, use it
    if (currentEpisode.video) {
      setVideoSrc(currentEpisode.video);
      return;
    }

    // Otherwise try to get a signed playback URL
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
      if (result.unlocked.includes(currentEpisode.episode)) {
        // Update local state to mark episode as unlocked
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
        // Fetch playback URL
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

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const skip = useCallback((sec: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += sec;
    setSkipAnim(sec > 0 ? "forward" : "back");
    setTimeout(() => setSkipAnim(null), 500);
  }, []);

  const fullscreen = useCallback(() => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Save watch progress periodically (every 15 seconds)
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

    // Update watch session
    if (sessionIdRef.current) {
      updateWatchSession(token, {
        sessionId: sessionIdRef.current,
        endPosSec: Math.floor(video.currentTime),
        durationSec: Math.floor(video.currentTime),
      }).catch(() => {});
    }
  }, [token, dramaId, currentEpisode]);

  // Start watch session when episode changes
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
      // End session on cleanup
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

  const handleTime = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
    saveProgress();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const value = Number(e.currentTarget.value);
    video.currentTime = (value / 100) * video.duration;
    setProgress(value);
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") skip(10);
      if (e.code === "ArrowLeft") skip(-10);
      if (e.key.toLowerCase() === "f") fullscreen();
    };

    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [togglePlay, skip, fullscreen]);

  const showControls = () => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), 2500);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    setMuted(!muted);
    video.muted = !muted;
  };

  const hasMultipleSeasons = localSeasons.length > 1;

  if (!currentEpisode) return null;

  return (
    <div className="w-full flex justify-center bg-black py-4 sm:py-6 md:py-10" id="movie">
      <div
        ref={playerRef}
        onMouseMove={showControls}
        onTouchStart={showControls}
        className="w-full max-w-7xl text-white relative px-0 sm:px-4"
      >
        {/* Video area */}
        <div
          className="relative w-full aspect-video bg-black overflow-hidden sm:rounded-2xl md:rounded-3xl"
          onDoubleClick={fullscreen}
        >
          {isLocked ? (
            /* Locked episode overlay */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
              <FaLock className="text-4xl text-gray-500 mb-4" />
              <p className="text-lg font-bold mb-2">Bu qism qulflangan</p>
              <p className="text-sm text-gray-400 mb-4">Coin sarflab ochishingiz mumkin</p>
              {token ? (
                <button
                  onClick={handleUnlock}
                  disabled={unlocking}
                  className="px-6 py-3 bg-second rounded-xl font-bold flex items-center gap-2 hover:bg-second/85 transition disabled:opacity-50"
                >
                  <FaCoins className="text-yellow-400" />
                  {unlocking ? "Ochilmoqda..." : "Coin bilan ochish"}
                </button>
              ) : (
                <a href="/login" className="px-6 py-3 bg-second rounded-xl font-bold hover:bg-second/85 transition">
                  Kirish
                </a>
              )}
            </div>
          ) : loadingVideo ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-second border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <video
                poster={currentEpisode.poster}
                key={currentEpisode.id + videoSrc}
                ref={videoRef}
                src={videoSrc || currentEpisode.video}
                className="w-full h-full"
                onTimeUpdate={handleTime}
                playsInline
              />

              {/* Tap zones for mobile */}
              <div
                onClick={() => {
                  const now = Date.now();
                  if ((window as any).__lastTap && now - (window as any).__lastTap < 300) {
                    skip(-10);
                  }
                  (window as any).__lastTap = now;
                }}
                className="absolute left-0 top-0 w-1/2 h-full"
              />
              <div
                onClick={() => {
                  const now = Date.now();
                  if ((window as any).__lastTap2 && now - (window as any).__lastTap2 < 300) {
                    skip(10);
                  }
                  (window as any).__lastTap2 = now;
                }}
                className="absolute right-0 top-0 w-1/2 h-full"
              />

              {/* Center play button */}
              {controls && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex justify-center items-center rounded-full bg-white/90 shadow-lg">
                    {playing ? (
                      <FaPause className="fill-second text-xl sm:text-3xl md:text-4xl" />
                    ) : (
                      <FaPlay className="ml-1 fill-second text-xl sm:text-3xl md:text-4xl" />
                    )}
                  </div>
                </button>
              )}

              {/* Skip animations */}
              {skipAnim === "back" && (
                <div className="absolute left-[20%] sm:left-1/3 top-1/2 -translate-y-1/2 text-3xl sm:text-5xl rounded-full animate-pulse p-2 bg-white flex text-second">
                  <MdReplay10 />
                </div>
              )}
              {skipAnim === "forward" && (
                <div className="absolute right-[20%] sm:right-1/3 top-1/2 -translate-y-1/2 text-3xl sm:text-5xl rounded-full animate-pulse p-2 bg-white flex text-second">
                  <MdForward10 />
                </div>
              )}

              {/* Bottom controls */}
              <div
                className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent transition duration-300 ${
                  controls ? "opacity-100" : "opacity-0"
                }`}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={seek}
                  className="w-full accent-second"
                />

                <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-5 text-base sm:text-lg md:text-xl">
                    <button onClick={togglePlay} className="hover:text-second transition">
                      {playing ? <FaPause /> : <FaPlay />}
                    </button>

                    <button onClick={() => skip(-10)} className="hidden sm:block hover:text-second transition">
                      <FaBackward />
                    </button>

                    <button onClick={() => skip(10)} className="hidden sm:block hover:text-second transition">
                      <FaForward />
                    </button>

                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="hover:text-second transition">
                        {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => {
                          const v = Number(e.currentTarget.value);
                          setVolume(v);
                          if (videoRef.current) videoRef.current.volume = v;
                        }}
                        className="w-16 sm:w-20 md:w-24 accent-second"
                      />
                    </div>
                  </div>

                  <button onClick={fullscreen} className="hover:text-second transition">
                    <FaExpand />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Episodes */}
        <div className="mt-4 sm:mt-6 md:mt-8 w-full bg-white/[0.03] backdrop-blur-md p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-white/5 mx-auto">
          {hasMultipleSeasons && (
            <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-4 sm:mb-6">
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
                      : "bg-white/5 border border-white/5 hover:bg-second/20 hover:border-second/20"
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
                        : "bg-white/5 border border-white/5 hover:bg-second/20 hover:border-second/20"
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
    </div>
  );
}
