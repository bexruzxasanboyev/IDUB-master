"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import { FaPlayCircle, FaRegBookmark, FaBookmark, FaStar } from "react-icons/fa";
import { useState } from "react";
import { Slide } from "../types/movie";

import "swiper/css";
import "swiper/css/effect-fade";

type Props = {
  slides: Slide[];
};

export default function MovieHeroSwiper({ slides }: Props) {
  const [saved, setSaved] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  return (
    <div className="relative font-second w-full min-h-[65vh] sm:min-h-[70vh] md:min-h-[45vw] overflow-hidden">
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
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full min-h-[65vh] sm:min-h-[70vh] md:min-h-[45vw]">
              {failedImages.has(index) ? (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
              ) : (
                <Image
                  src={slide.banner}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover scale-105"
                  onError={() => setFailedImages((prev) => new Set(prev).add(index))}
                />
              )}
              {/* Multi-layer gradients for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-main via-main/50 to-main/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-main to-transparent" />

              <div className="absolute inset-0 container flex items-end sm:items-center pb-20 sm:pb-0">
                <div
                  className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl text-white space-y-3 sm:space-y-4 md:space-y-5"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s",
                  }}
                >
                  {/* Genres */}
                  <div className="flex flex-wrap gap-2">
                    {slide.genres?.map((g: any, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-[11px] sm:text-xs bg-white/10 backdrop-blur-md rounded-lg border border-white/10 font-medium"
                      >
                        {typeof g === "string" ? g : g.title || g.slug}
                      </span>
                    ))}
                    {slide.year && (
                      <span className="px-2.5 py-1 text-[11px] sm:text-xs bg-second/20 text-second rounded-lg font-bold border border-second/20">
                        {slide.year}
                      </span>
                    )}
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-main leading-[1.1] tracking-tight">
                    {slide.title}
                  </h2>

                  <p className="text-xs sm:text-sm md:text-base text-gray-300/90 leading-relaxed font-text line-clamp-3 max-w-lg">
                    {slide.desc}
                  </p>

                  {/* Info badges */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {slide.seasonNumber && (
                      <span className="px-2.5 py-1 bg-white/8 rounded-lg border border-white/5">{slide.seasonNumber} Fasl</span>
                    )}
                    {slide.seriesNumber && (
                      <span className="px-2.5 py-1 bg-white/8 rounded-lg border border-white/5">{slide.seriesNumber} Qism</span>
                    )}
                    {slide.rating && (
                      <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 rounded-lg font-semibold flex items-center gap-1 border border-yellow-500/10">
                        <FaStar className="text-[10px]" />
                        {slide.rating}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2 sm:pt-3">
                    <button className="bg-second text-white px-5 sm:px-8 py-3 sm:py-3.5 flex items-center justify-center gap-2.5 rounded-xl text-sm sm:text-base font-semibold hover:bg-second/85 hover:shadow-[0_8px_30px_rgba(126,84,230,0.35)] transition-all duration-300 active:scale-95">
                      <FaPlayCircle className="text-lg" />
                      <span>TOMOSHA QILISH</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSaved(!saved);
                      }}
                      className="text-white px-5 sm:px-7 border-white/20 border-2 py-3 sm:py-3.5 flex items-center justify-center gap-2 rounded-xl text-sm sm:text-base hover:border-second/60 hover:bg-second/10 hover:text-second transition-all duration-300 active:scale-95 backdrop-blur-sm"
                    >
                      {saved ? <FaBookmark className="fill-second" /> : <FaRegBookmark />}
                      <span className="hidden sm:inline font-medium">SAQLASH</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slide indicators */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 md:right-12 z-10 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              activeIndex === i ? "w-8 bg-second" : "w-2 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
