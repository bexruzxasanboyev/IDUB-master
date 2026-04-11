"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X, SlidersHorizontal, Star, Calendar } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export default function FilterModal({ open, setOpen }: Props) {
  const router = useRouter();

  const [type, setType] = useState("");
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState("");
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(2024);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState("");

  const applyFilters = () => {
    const query = new URLSearchParams();
    if (type) query.set("type", type);
    if (genre) query.set("genre", genre);
    if (country) query.set("country", country);
    if (rating) query.set("rating", rating.toString());
    if (sort) query.set("sort", sort);
    query.set("minYear", String(minYear));
    query.set("maxYear", String(maxYear));

    router.push(`/search?${query.toString()}`);
    setOpen(false);
  };

  const resetFilters = () => {
    setType("");
    setGenre("");
    setCountry("");
    setRating(0);
    setMinYear(2000);
    setMaxYear(2024);
    setSort("");
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* PANEL */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[320px] sm:max-w-[360px] bg-surface/98 backdrop-blur-xl border-l border-white/5 z-50 transform transition-all duration-400 ease-out overflow-y-auto shadow-[-20px_0_60px_rgba(0,0,0,0.5)]
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5 sm:p-6 space-y-5 text-white">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-second" />
              Filter
            </h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* TYPE */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Turi</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              <option value="">Barchasi</option>
              <option value="Film">Film</option>
              <option value="Series">Serial</option>
            </select>
          </div>

          {/* GENRE */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Janr</label>
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input">
              <option value="">Barcha janrlar</option>
              <option value="drama">Drama</option>
              <option value="comedy">Komediya</option>
              <option value="romance">Romantika</option>
            </select>
          </div>

          {/* COUNTRY */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Davlat</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
              <option value="">Barcha davlatlar</option>
              <option value="South Korea">Koreya</option>
              <option value="Japan">Yaponiya</option>
            </select>
          </div>

          {/* YEAR */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1.5">
              <Calendar size={14} /> Yil: {minYear} — {maxYear}
            </label>
            <input
              type="range"
              min="1990"
              max="2025"
              value={minYear}
              onChange={(e) => setMinYear(+e.target.value)}
              className="w-full"
            />
            <input
              type="range"
              min="1990"
              max="2025"
              value={maxYear}
              onChange={(e) => setMaxYear(+e.target.value)}
              className="w-full"
            />
          </div>

          {/* RATING */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1.5">
              <Star size={14} className="text-yellow-400" /> Reyting: {rating.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
              className="w-full"
            />
          </div>

          {/* SORT */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400">Saralash</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input">
              <option value="">Standart</option>
              <option value="views">Eng ko'p ko'rilgan</option>
              <option value="likes">Eng yoqqan</option>
              <option value="bookmarks">Eng ko'p saqlangan</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="space-y-3 pt-3">
            <button
              onClick={applyFilters}
              className="w-full py-3 bg-second rounded-xl font-medium hover:bg-second/85 hover:shadow-[0_4px_20px_rgba(126,84,230,0.3)] transition-all duration-300 active:scale-[0.98]"
            >
              Qo&apos;llash
            </button>
            <button
              onClick={resetFilters}
              className="w-full py-3 bg-white/5 border border-white/5 rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
            >
              Tozalash
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
