"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, Smartphone, Star, Shield, Zap } from "lucide-react";

const SCREENSHOTS = [
  "/assets/app/photo_1_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_2_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_3_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_4_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_5_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_6_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_7_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_8_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_9_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_10_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_11_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_12_2026-04-26_16-03-19.jpg",
  "/assets/app/photo_13_2026-04-26_16-03-19.jpg",
];

const FEATURES = [
  { icon: Zap, title: "Tez ishlaydi", desc: "Optimallashtirilgan video pleer va silliq UI" },
  { icon: Shield, title: "Xavfsiz", desc: "Barcha ma'lumotlar shifrlangan, akkauntingiz himoyalangan" },
  { icon: Star, title: "VIP imkoniyatlar", desc: "Ekskluziv kontent va reklamasiz tomosha" },
];

export default function IlovaPage() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const scrollTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - 16, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let minDist = Infinity;
    children.forEach((c, i) => {
      const cCenter = c.offsetLeft + c.clientWidth / 2;
      const dist = Math.abs(cCenter - center);
      if (dist < minDist) {
        minDist = dist;
        nearest = i;
      }
    });
    setActive(nearest);
  };

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((p) => (p === null ? null : (p + 1) % SCREENSHOTS.length));
      if (e.key === "ArrowLeft") setLightbox((p) => (p === null ? null : (p - 1 + SCREENSHOTS.length) % SCREENSHOTS.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        {/* Hero */}
        <div className="grid md:grid-cols-[auto,1fr] gap-6 md:gap-8 items-center mb-10 sm:mb-14">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0">
            <Image
              src="/assets/app-logo.webp"
              width={128}
              height={128}
              alt="iDub"
              priority
              className="w-full h-full object-contain drop-shadow-[0_8px_24px_rgba(126,84,230,0.45)]"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">iDub.tv</h1>
            <p className="text-gray-400 text-sm sm:text-base mb-4">
              O'zbek tilida dramalar, filmlar va serial — bir ilovada
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4 mb-5">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.8</span>
                <span className="text-gray-500 text-sm">(2.4k)</span>
              </div>
              <div className="text-gray-400 text-sm">
                <span className="text-white font-semibold">100K+</span> yuklab olingan
              </div>
              <div className="text-gray-400 text-sm">
                <Smartphone className="inline w-4 h-4 mr-1" />
                Android 6.0+
              </div>
            </div>

            <a
              href="/iDub.apk"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-second hover:bg-second/85 rounded-xl font-bold transition active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              APK yuklab olish
              <span className="text-xs opacity-75 font-normal ml-1">(98 MB)</span>
            </a>
          </div>
        </div>

        {/* Screenshots slider */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Ekran rasmlari</h2>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scrollTo(Math.max(0, active - 1))}
                disabled={active === 0}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-full transition"
                aria-label="Oldingi"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollTo(Math.min(SCREENSHOTS.length - 1, active + 1))}
                disabled={active === SCREENSHOTS.length - 1}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 rounded-full transition"
                aria-label="Keyingi"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SCREENSHOTS.map((src, i) => (
              <button
                key={src}
                onClick={() => setLightbox(i)}
                className="snap-start shrink-0 w-[60%] sm:w-[280px] md:w-[300px] aspect-[9/19.5] rounded-2xl overflow-hidden border border-white/10 bg-surface relative group cursor-zoom-in"
              >
                <Image
                  src={src}
                  alt={`iDub screenshot ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 60vw, 300px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  priority={i < 2}
                />
              </button>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {SCREENSHOTS.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-6 bg-second" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Asosiy imkoniyatlar</h2>
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface border border-white/5 rounded-2xl p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-second/15 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-second" />
                </div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Install instructions */}
        <section className="bg-surface border border-white/5 rounded-2xl p-5 sm:p-6">
          <h2 className="text-xl font-bold mb-4">O'rnatish bo'yicha qo'llanma</h2>
          <ol className="space-y-3">
            {[
              "APK faylni yuklab oling (yuqoridagi tugma orqali)",
              "Telefoningiz sozlamalaridan \"Noma'lum manbalar\"ga ruxsat bering",
              "Yuklangan APK faylni oching va o'rnating",
              "Ilovani oching, Telegram orqali ro'yxatdan o'ting va tomosha qilishni boshlang",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-second/15 text-second font-bold text-sm flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-gray-300 text-sm sm:text-base">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((p) => (p === null ? null : (p - 1 + SCREENSHOTS.length) % SCREENSHOTS.length));
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Oldingi"
          >
            <ChevronLeft />
          </button>
          <div className="relative w-full max-w-md aspect-[9/19.5]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={SCREENSHOTS[lightbox]}
              alt={`iDub screenshot ${lightbox + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((p) => (p === null ? null : (p + 1) % SCREENSHOTS.length));
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            aria-label="Keyingi"
          >
            <ChevronRight />
          </button>
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-xl"
            aria-label="Yopish"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
