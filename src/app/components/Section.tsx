"use client";

import { useRef, useState } from "react";
import Card from "./Card";
import TrendingCard from "./TrendingCard";
import Modal from "./Modal";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css";

type Item = {
  id: string;
  title: string;
  poster: string;
  seriesNumber?: number;
  seasonNumber?: number;
  genres?: string[];
  desc?: string;
};

type SectionProps = {
  title: string;
  data: Item[];
  href?: string;
  type?: "default" | "trending";
};

export default function Section({
  title,
  data,
  href,
  type = "default",
}: SectionProps) {
  const swiperRef = useRef<any>(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Item | null>(null);

  const handleSlideChange = (swiper: any) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleOpen = (id: string) => {
    const movie = data.find((m) => m.id === id);
    if (!movie) return;
    setSelected(movie);
    setOpen(true);
  };

  const isTrending = type === "trending";

  return (
    <section className="relative w-full py-5 sm:py-8 md:py-10">
      <div className="container relative">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 sm:mb-7">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 sm:h-7 bg-second rounded-full" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-main text-white tracking-tight">
              {title}
            </h2>
          </div>

          {href && (
            <Link
              href={href}
              className="text-xs sm:text-sm text-white/80 font-second whitespace-nowrap py-1.5 sm:py-2 px-3 sm:px-4 bg-white/8 border border-white/5 rounded-lg hover:bg-second/20 hover:text-second hover:border-second/20 transition-all duration-300 active:scale-95"
            >
              <span className="hidden sm:inline">Barchasini ko&apos;rish</span>
              <span className="sm:hidden">Barchasi</span>
              <span className="ml-1">&rarr;</span>
            </Link>
          )}
        </div>

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
            className="overflow-visible!"
            breakpoints={{
              380: { slidesPerView: 2.2, spaceBetween: 14 },
              480: { slidesPerView: 2.5, spaceBetween: 16 },
              640: { slidesPerView: 3.2, spaceBetween: 20 },
              768: { slidesPerView: 4.2, spaceBetween: 24 },
              1024: { slidesPerView: 5.2, spaceBetween: 28 },
              1280: { slidesPerView: 5.2, spaceBetween: 30 },
            }}
          >
            {data.map((item, index) => (
              <SwiperSlide key={item.id}>
                {isTrending ? (
                  <TrendingCard
                    id={item.id}
                    index={index}
                    title={item.title}
                    poster={item.poster}
                    onOpen={handleOpen}
                  />
                ) : (
                  <Card
                    id={item.id}
                    title={item.title}
                    poster={item.poster}
                    seriesNumber={item.seriesNumber}
                    seasonNumber={item.seasonNumber}
                    genres={item.genres}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Only mount the Modal tree once the user actually opens it —
            keeps every Section's idle cost near zero. */}
        {(open || selected) && (
          <Modal open={open} onClose={() => setOpen(false)} movie={selected} />
        )}
      </div>
    </section>
  );
}
