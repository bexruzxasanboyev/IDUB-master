"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Card from "@/app/components/Card";

import "swiper/css";

type SimilarItem = {
  id: string;
  title: string;
  poster: string;
  seasonNumber?: number;
  seriesNumber?: number;
};

export default function SimilarSwiper({ items }: { items: SimilarItem[] }) {
  const swiperRef = useRef<any>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: any) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  return (
    <div className="relative">
      {!isEnd && (
        <div className="pointer-events-none absolute -right-4 sm:-right-6 md:-right-10 top-0 z-20 h-full scale-110 w-16 sm:w-24 md:w-45 bg-gradient-to-l from-main via-main/80 to-transparent" />
      )}

      {!isBeginning && (
        <div className="pointer-events-none absolute -left-4 sm:-left-6 md:-left-10 top-0 z-20 h-full scale-110 w-16 sm:w-24 md:w-45 bg-gradient-to-r from-main via-main/80 to-transparent" />
      )}

      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className={`hidden sm:flex absolute -left-3 md:-left-7.5 top-1/2 -translate-y-1/2 z-30
        w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10
        items-center justify-center text-white
        hover:bg-second/50 hover:border-second/30 hover:shadow-[0_4px_20px_rgba(126,84,230,0.25)]
        transition-all duration-300 active:scale-90 ${isBeginning ? "!hidden" : ""}`}
      >
        <FaChevronLeft className="text-sm" />
      </button>

      <button
        onClick={() => swiperRef.current?.slideNext()}
        className={`hidden sm:flex absolute -right-3 md:-right-7.5 top-1/2 -translate-y-1/2 z-30
        w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10
        items-center justify-center text-white
        hover:bg-second/50 hover:border-second/30 hover:shadow-[0_4px_20px_rgba(126,84,230,0.25)]
        transition-all duration-300 active:scale-90 ${isEnd ? "!hidden" : ""}`}
      >
        <FaChevronRight className="text-sm" />
      </button>

      <Swiper
        spaceBetween={12}
        slidesPerView={1.8}
        grabCursor
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        className="!overflow-hidden"
        breakpoints={{
          380: { slidesPerView: 2.2, spaceBetween: 14 },
          480: { slidesPerView: 2.5, spaceBetween: 16 },
          640: { slidesPerView: 3.2, spaceBetween: 20 },
          768: { slidesPerView: 4.2, spaceBetween: 24 },
          1024: { slidesPerView: 5.2, spaceBetween: 28 },
          1280: { slidesPerView: 5.2, spaceBetween: 30 },
        }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <Card
              id={item.id}
              title={item.title}
              poster={item.poster}
              seriesNumber={item.seriesNumber}
              seasonNumber={item.seasonNumber}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
