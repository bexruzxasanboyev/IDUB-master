"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTimes, FaPlay } from "react-icons/fa";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  movie: any;
};

export default function Modal({ open, onClose, movie }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !movie) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-0 sm:p-6 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-surface rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto
          shadow-[0_25px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.05)]
          animate-slide-up sm:animate-scale-in"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 sm:top-4 sm:right-4 text-white/80 text-lg z-20 hover:text-white hover:scale-110 hover:rotate-90 transition-all duration-300 bg-black/50 backdrop-blur-sm rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-white/10"
        >
          <FaTimes />
        </button>

        {/* Image */}
        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
          <Image
            src={movie.banner || movie.poster}
            alt={movie.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/30 to-surface" />
        </div>

        {/* Info */}
        <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-center -mt-8 relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-main mb-3 sm:mb-4 leading-tight">
            {movie.title}
          </h2>

          <div className="flex gap-2 flex-wrap mb-3 sm:mb-4">
            {movie.genres?.map((g: any, i: number) => (
              <span
                key={i}
                className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs bg-white/8 text-white/80 rounded-lg border border-white/5"
              >
                {typeof g === "string" ? g : g.title || g.slug}
              </span>
            ))}
          </div>

          <p className="text-gray-400 mb-5 sm:mb-6 text-sm sm:text-base leading-relaxed line-clamp-4">
            {movie.desc}
          </p>

          <Link
            href={`/movie/${movie.id}`}
            className="flex items-center gap-3 w-fit px-5 sm:px-7 py-2.5 sm:py-3.5 bg-second text-white rounded-xl hover:bg-second/85 hover:shadow-[0_8px_30px_rgba(126,84,230,0.3)] transition-all duration-300 active:scale-95 text-sm sm:text-base font-medium"
          >
            <FaPlay className="text-xs" />
            Tomosha qilish
          </Link>
        </div>
      </div>
    </div>
  );
}
