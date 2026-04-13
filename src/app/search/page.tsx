"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X, Calendar, Star } from "lucide-react";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";
import { searchDramas, getTopSearchedDramas, getTopSearches, getDramas, getGenres, trackSearchClick, type DramaItem, type TopSearch, type Genre } from "@/lib/api";
import { addSearchHistory } from "@/lib/search-history";

function capitalize(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type CardItem = {
  id: string;
  title: string;
  poster: string;
  seriesNumber?: number;
  seasonNumber?: number;
  genres?: string[];
  year?: number;
  rating?: number;
  country?: string;
};

function mapItems(items: DramaItem[]): CardItem[] {
  return items.map((d) => ({
    id: d.id,
    title: d.title,
    poster: d.posterUrl,
    seriesNumber: d.seriesNumber,
    seasonNumber: d.seasonNumber,
    genres: d.genres,
    year: d.year,
    rating: d.imdbRating,
    country: d.country,
  }));
}

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q") || "";

  const [results, setResults] = useState<CardItem[]>([]);
  const [topSearches, setTopSearches] = useState<TopSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);

  // Filters
  const [minYear, setMinYear] = useState(2000);
  const [maxYear, setMaxYear] = useState(2026);
  const [rating, setRating] = useState(0);
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const resetFilters = () => {
    setMinYear(2000);
    setMaxYear(2026);
    setRating(0);
    setGenre("");
    setCountry("");
    setSort("");
    setFiltersApplied(false);
  };

  // Load genres for filter
  useEffect(() => {
    getGenres().then((data) => setAllGenres(data.genres)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query.trim()) {
          addSearchHistory(query.trim());
          const data = await searchDramas(query);
          setResults(mapItems(data.items));
        } else {
          // No query — show top searched dramas + top search queries
          const [dramaData, searchData] = await Promise.all([
            getTopSearchedDramas().catch(() => ({ items: [] })),
            getTopSearches().catch(() => ({ items: [] })),
          ]);
          setResults(mapItems(dramaData.items));
          setTopSearches(searchData.items);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (!filtersApplied) {
      fetchResults();
    }
  }, [query, filtersApplied]);

  const applyFilters = async () => {
    setIsFilterOpen(false);
    setFiltersApplied(true);
    setLoading(true);
    try {
      const data = await getDramas({
        genre: genre || undefined,
        sort: sort || undefined,
        page: 1,
        limit: 50,
      });
      let filtered = mapItems(data.items);

      // Client-side filters for year, rating, country
      if (minYear > 2000 || maxYear < 2026) {
        filtered = filtered.filter((item) => {
          if (!item.year) return true;
          return item.year >= minYear && item.year <= maxYear;
        });
      }
      if (rating > 0) {
        filtered = filtered.filter((item) => (item.rating || 0) >= rating);
      }
      if (country) {
        filtered = filtered.filter((item) =>
          item.country?.toLowerCase().includes(country.toLowerCase())
        );
      }
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (dramaId: string) => {
    if (query.trim()) {
      trackSearchClick(query.trim().toLowerCase(), dramaId).catch(() => {});
    }
  };

  const hasActiveFilters = genre || sort || rating > 0 || minYear > 2000 || maxYear < 2026 || country;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black/95 to-zinc-950 text-white pt-20 sm:pt-24">
      <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:py-6 md:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-5 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {filtersApplied ? (
              <>
                Filter natijalari
                <span className="ml-2 text-zinc-500 font-normal text-sm sm:text-base">({results.length})</span>
              </>
            ) : query ? (
              <>
                &ldquo;{capitalize(query)}&rdquo; bo&apos;yicha natijalar
                {results.length > 0 && (
                  <span className="ml-2 text-zinc-500 font-normal text-sm sm:text-base">({results.length})</span>
                )}
              </>
            ) : (
              "Top qidirilganlar"
            )}
          </h1>

          <div className="flex items-center gap-2">
            {filtersApplied && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 hover:bg-red-500/20 transition"
              >
                <X size={12} /> Filterni tozalash
              </button>
            )}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium hover:bg-zinc-700/80 transition border ${
                hasActiveFilters
                  ? "bg-second/15 border-second/30 text-second"
                  : "bg-zinc-800/80 border-zinc-700/70"
              }`}
            >
              <SlidersHorizontal size={16} className="text-second" />
              Filter
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-second" />}
            </button>
          </div>
        </div>

        {/* Top search queries */}
        {!query && !filtersApplied && topSearches.length > 0 && !loading && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Top qidiruvlar</h2>
            <div className="flex flex-wrap gap-2">
              {topSearches.map((item) => (
                <a
                  key={item.rank}
                  href={`/search?q=${encodeURIComponent(item.queryNormalized)}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/5 rounded-full text-sm hover:bg-second/15 hover:border-second/20 transition"
                >
                  <span className="text-second font-bold text-xs">{item.rank}</span>
                  <span>{item.queryNormalized}</span>
                  <span className="text-[10px] text-gray-500">{item.searchCount}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            variant={filtersApplied ? "filter" : "search"}
            title={
              filtersApplied
                ? "Filter natijalari topilmadi"
                : "Hech narsa topilmadi"
            }
            description={
              filtersApplied
                ? "Filterlarni qayta sozlab ko'ring yoki boshqa janrni tanlang"
                : "Boshqa so'rov bilan qidirib ko'ring yoki filterlarni o'zgartiring"
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {results.map((movie) => (
              <div key={movie.id} onClick={() => handleCardClick(movie.id)}>
                <Card
                  id={movie.id}
                  title={movie.title}
                  poster={movie.poster}
                  seriesNumber={movie.seriesNumber}
                  seasonNumber={movie.seasonNumber}
                  genres={movie.genres}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isFilterOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsFilterOpen(false)}
        />

        <div
          className={`absolute top-0 bottom-0 right-0 w-[85vw] max-w-[300px] sm:max-w-[360px] bg-zinc-900/98 backdrop-blur-xl border-l border-zinc-800 shadow-2xl overflow-y-auto transition-transform duration-300 ease-out z-10 ${
            isFilterOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-second" />
                Filter
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-zinc-800/80 transition"
              >
                <X size={22} />
              </button>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs sm:text-sm text-zinc-400 hover:text-white flex items-center gap-1.5"
            >
              <X size={14} /> Barchasini tozalash
            </button>

            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Janr</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input">
                <option value="">Barcha janrlar</option>
                {allGenres.map((g) => (
                  <option key={g.id} value={g.slug}>{g.title}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Davlat</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
                <option value="">Barcha davlatlar</option>
                <option value="South Korea">Janubiy Koreya</option>
                <option value="Japan">Yaponiya</option>
                <option value="China">Xitoy</option>
                <option value="Thailand">Tailand</option>
                <option value="Taiwan">Tayvan</option>
              </select>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Calendar size={14} /> Yil: {minYear} — {maxYear}
              </label>
              <input type="range" min={1990} max={2026} value={minYear} onChange={(e) => setMinYear(+e.target.value)} className="w-full" />
              <input type="range" min={1990} max={2026} value={maxYear} onChange={(e) => setMaxYear(+e.target.value)} className="w-full" />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400" /> Reyting: {rating.toFixed(1)}+
              </label>
              <input type="range" min={0} max={10} step={0.1} value={rating} onChange={(e) => setRating(+e.target.value)} className="w-full" />
            </div>

            {/* Sort */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Saralash</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input">
                <option value="">Mos kelish bo&apos;yicha</option>
                <option value="popular">Eng mashhur</option>
                <option value="newest">Eng yangi</option>
                <option value="oldest">Eng eski</option>
              </select>
            </div>

            <div className="pt-3">
              <button
                onClick={applyFilters}
                className="w-full py-3 bg-second hover:bg-second/80 rounded-xl font-medium transition active:scale-[0.98]"
              >
                Natijalarni ko&apos;rsatish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
