"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBookmark, FaRegBookmark, FaPlay } from "react-icons/fa";
import { useAuth } from "@/lib/auth";
import { normalizeImageUrl } from "@/lib/api";
import { useSaved } from "@/lib/saved-context";

type CardProps = {
  id: string;
  title: string;
  poster: string;
  seriesNumber?: number;
  seasonNumber?: number;
  genres?: (string | { title?: string; slug?: string })[];
};

export default function Card({
  id,
  title,
  poster,
  seriesNumber,
  seasonNumber,
  genres,
}: CardProps) {
  const { token } = useAuth();
  const { isSaved, toggleSaved } = useSaved();
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [imgError, setImgError] = useState(false);
  const normalizedPoster = normalizeImageUrl(poster);
  const saved = isSaved(id);

  const toggleSave = async () => {
    if (savingInProgress || !token) return;
    setSavingInProgress(true);
    try {
      await toggleSaved(id, "web");
    } finally {
      setSavingInProgress(false);
    }
  };

  return (
    <Link
      href={`/movie/${id}`}
      className="group relative block aspect-[2/3] overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer
        transition-all duration-500 ease-out
        hover:scale-[1.03] sm:hover:scale-[1.05]
        hover:shadow-[0_20px_60px_rgba(126,84,230,0.15),0_8px_30px_rgba(0,0,0,0.5)]
        hover:z-10"
    >
      {imgError || !normalizedPoster ? (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
          <span className="text-white/30 text-4xl font-bold">{title?.charAt(0) || "?"}</span>
        </div>
      ) : (
        <Image
          src={normalizedPoster}
          alt={title}
          width={500}
          height={750}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      )}

      {/* Permanent bottom gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-second/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Season info badges */}
      {seasonNumber && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1.5 text-[10px] sm:text-xs
          sm:translate-y-[-8px] sm:opacity-0
          sm:transition-all sm:duration-500 sm:ease-out
          sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 font-main bg-black/50 backdrop-blur-md text-white rounded-lg border border-white/10">
            {seriesNumber} Qism
          </div>
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 font-main bg-black/50 backdrop-blur-md text-white rounded-lg border border-white/10">
            {seasonNumber} Fasl
          </div>
        </div>
      )}

      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center
        opacity-0 group-hover:opacity-100
        translate-y-2 group-hover:translate-y-0
        transition-all duration-400 ease-out">
        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm
          group-hover:scale-100 scale-75 transition-transform duration-400">
          <FaPlay className="fill-second text-sm sm:text-lg ml-0.5" />
        </div>
      </div>

      {/* Bookmark */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSave();
        }}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full
          bg-black/40 backdrop-blur-sm text-white border border-white/10
          sm:translate-y-[-8px] sm:opacity-0
          sm:transition-all sm:duration-400 sm:ease-out
          sm:group-hover:translate-y-0 sm:group-hover:opacity-100
          hover:bg-second/60 active:scale-90"
      >
        {saved ? <FaBookmark className="fill-second text-xs sm:text-sm" /> : <FaRegBookmark className="text-xs sm:text-sm" />}
      </button>

      {/* Bottom info */}
      <div className="absolute bottom-0 w-full p-2.5 sm:p-4
        sm:translate-y-3 sm:opacity-0
        sm:transition-all sm:duration-500 sm:ease-out sm:delay-75
        sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <h3 className="text-white font-main text-sm sm:text-base md:text-lg leading-snug line-clamp-2 drop-shadow-lg">
          {title}
        </h3>

        <div className="flex flex-wrap gap-1 mt-1.5 sm:mt-2 font-text">
          {genres?.slice(0, 3).map((g, i) => (
            <span
              key={i}
              className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-md text-white/90 border border-white/5"
            >
              {typeof g === "string" ? g : g.title || g.slug}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
