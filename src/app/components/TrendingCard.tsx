"use client";

import { useState } from "react";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import { normalizeImageUrl } from "@/lib/api";

type TrendingCardProps = {
  id: string;
  index: number;
  title: string;
  poster: string;
  onOpen: (id: string) => void;
};

export default function TrendingCard({
  id,
  index,
  title,
  poster,
  onOpen,
}: TrendingCardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      onClick={() => onOpen(id)}
      className="group relative cursor-pointer select-none"
    >
      <div className="relative flex items-end transition-transform duration-500 ease-out group-hover:scale-[1.03] sm:group-hover:scale-[1.05]">
        {/* NUMBER */}
        <span
          className="
          absolute -left-3 sm:-left-5 md:-left-6 bottom-2 sm:bottom-4 z-10
          text-[70px] sm:text-[90px] md:text-[120px] font-black leading-none
          text-transparent
          [-webkit-text-stroke:2px_rgba(126,84,230,0.7)] sm:[-webkit-text-stroke:3px_rgba(126,84,230,0.8)]
          drop-shadow-[0_0_20px_rgba(126,84,230,0.3)]
          transition-all duration-500
          group-hover:[-webkit-text-stroke:2px_rgba(126,84,230,1)] sm:group-hover:[-webkit-text-stroke:3px_rgba(126,84,230,1)]
          group-hover:drop-shadow-[0_0_30px_rgba(126,84,230,0.5)]
          group-hover:scale-[1.04]
          "
        >
          {index + 1}
        </span>

        {/* POSTER */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
          {imgError ? (
            <div className="w-36 h-52 sm:w-48 sm:h-68 md:w-60 md:h-85 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
              <span className="text-white/30 text-3xl font-bold">{title.charAt(0)}</span>
            </div>
          ) : (
            <Image
              src={normalizeImageUrl(poster) || poster}
              alt={title}
              width={500}
              height={700}
              sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 240px"
              quality={75}
              loading="lazy"
              className="w-36 h-52 sm:w-48 sm:h-68 md:w-60 md:h-85 object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          {/* Play button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.4)] scale-75 group-hover:scale-100 transition-transform duration-400">
              <FaPlay className="fill-second text-sm sm:text-base ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-white/90 font-main line-clamp-1 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>
    </div>
  );
}
