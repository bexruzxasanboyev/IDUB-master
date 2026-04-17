"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import { FaPlayCircle, FaRegBookmark, FaBookmark, FaStar } from "react-icons/fa";
import { useState } from "react";
import { Slide } from "../types/movie";
import { useAuth } from "@/lib/auth";
import { useSaved } from "@/lib/saved-context";

import "swiper/css";
import "swiper/css/effect-fade";

type Props = {
  slides: Slide[];
};

export default function MovieHeroSwiper({ slides }: Props) {
  const { token } = useAuth();
  const { isSaved, toggleSaved } = useSaved();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleToggleSave = async (id: string) => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (savingId) return;
    setSavingId(id);
    try {
      await toggleSaved(id, "web");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="relative font-second w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[45vw] overflow-hidden">
      <Swiper
        modules={[EffectFade, Autoplay]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        speed={1200}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full"
      >
        {slides.map((slide, index) => {
          const saved = isSaved(slide.id);
          const isSaving = savingId === slide.id;
          return (
            <SwiperSlide key={slide.id ?? index}>
              <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[45vw]">
                {failedImages.has(index) ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                ) : (
                  <Image
                    src={slide.banner}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "low"}
                    sizes="100vw"
                    quality={80}
                    className="object-cover scale-105"
                    onError={() => setFailedImages((prev) => new Set(prev).add(index))}
                  />
                )}
                {/* Multi-layer gradients for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-main via-main/50 to-main/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-main to-transparent" />

                <div className="absolute inset-0 container flex items-end sm:items-center pb-16 sm:pb-0 px-4 sm:px-6">
                  <div
                    className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl text-white space-y-2.5 sm:space-y-4 md:space-y-5"
                    style={{
                      opacity: activeIndex === index ? 1 : 0,
                      transform: activeIndex === index ? "translateY(0)" : "translateY(20px)",
                      transition:
                        "opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s",
                    }}
                  >
                    {/* Genres */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {slide.genres?.slice(0, 3).map((g, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg border border-white/10 font-medium"
                        >
                          {typeof g === "string" ? g : g.title || g.slug}
                        </span>
                      ))}
                      {slide.year && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs bg-second/20 text-second rounded-md sm:rounded-lg font-bold border border-second/20">
                          {slide.year}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-main leading-[1.1] tracking-tight line-clamp-2">
                      {slide.title}
                    </h2>

                    <p className="text-[11px] sm:text-sm md:text-base text-gray-300/90 leading-relaxed font-text line-clamp-2 sm:line-clamp-3 max-w-lg">
                      {slide.desc}
                    </p>

                    {/* Info badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
                      {slide.seasonNumber && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/8 rounded-md sm:rounded-lg border border-white/5">
                          {slide.seasonNumber} Fasl
                        </span>
                      )}
                      {slide.seriesNumber && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/8 rounded-md sm:rounded-lg border border-white/5">
                          {slide.seriesNumber} Qism
                        </span>
                      )}
                      {slide.rating && (
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-second/15 text-second rounded-md sm:rounded-lg font-semibold flex items-center gap-1 border border-second/20">
                          <FaStar className="text-[9px] sm:text-[10px]" />
                          {slide.rating}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-3">
                      <Link
                        href={`/movie/${slide.id}`}
                        className="bg-second text-white px-3.5 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-center gap-1.5 sm:gap-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-base font-semibold hover:bg-second/85 hover:shadow-[0_8px_30px_rgba(126,84,230,0.35)] transition-all duration-300 active:scale-95 whitespace-nowrap"
                      >
                        <FaPlayCircle className="text-base sm:text-lg shrink-0" />
                        <span>TOMOSHA QILISH</span>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(slide.id);
                        }}
                        disabled={isSaving}
                        aria-label={saved ? "Saqlangan" : "Saqlash"}
                        className="text-white px-3.5 sm:px-7 border-white/20 border-2 py-2.5 sm:py-3.5 flex items-center justify-center gap-2 rounded-lg sm:rounded-xl text-[11px] sm:text-base hover:border-second/60 hover:bg-second/10 hover:text-second transition-all duration-300 active:scale-95 backdrop-blur-sm disabled:opacity-60 shrink-0"
                      >
                        {saved ? (
                          <FaBookmark className="fill-second text-second" />
                        ) : (
                          <FaRegBookmark />
                        )}
                        <span className="hidden sm:inline font-medium">
                          {saved ? "SAQLANGAN" : "SAQLASH"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Slide indicators */}
      <div className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 md:right-12 z-10 flex gap-1.5 sm:gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              activeIndex === i ? "w-6 sm:w-8 bg-second" : "w-1.5 sm:w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
