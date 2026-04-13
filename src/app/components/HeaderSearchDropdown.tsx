"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Clock, TrendingUp, ArrowUpRight, Film } from "lucide-react";
import {
  searchDramas,
  getTopSearchedDramas,
  normalizeImageUrl,
  type DramaItem,
} from "@/lib/api";
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
  type SearchHistoryItem,
} from "@/lib/search-history";

type Props = {
  onClose?: () => void;
};

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HeaderSearchDropdown({ onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 220);

  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<DramaItem[]>([]);
  const [trending, setTrending] = useState<DramaItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Load history + trending once on mount
  useEffect(() => {
    setHistory(getSearchHistory());
    inputRef.current?.focus();
    getTopSearchedDramas()
      .then((data) => setTrending(data.items.slice(0, 6)))
      .catch(() => {});
  }, []);

  // Live search
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchDramas(q)
      .then((data) => {
        if (cancelled) return;
        setSuggestions(data.items.slice(0, 6));
      })
      .catch(() => {
        if (cancelled) return;
        setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const submit = useCallback(
    (q: string) => {
      const clean = q.trim();
      if (!clean) return;
      addSearchHistory(clean);
      setHistory(getSearchHistory());
      router.push(`/search?q=${encodeURIComponent(clean)}`);
      onClose?.();
    },
    [router, onClose]
  );

  const navigateToDrama = (id: string) => {
    router.push(`/movie/${id}`);
    onClose?.();
  };

  const handleRemoveHistory = (e: React.MouseEvent, q: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeSearchHistory(q);
    setHistory(getSearchHistory());
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearSearchHistory();
    setHistory([]);
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-16 sm:mt-20 max-w-3xl px-4 sm:px-6"
      >
        <div className="bg-gradient-to-b from-surface to-main/95 border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(query);
            }}
            className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/5"
          >
            <Search className="text-second shrink-0" size={20} strokeWidth={2.2} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Film, serial, aktyor qidiring..."
              className="flex-1 bg-transparent outline-none text-base sm:text-lg text-white placeholder:text-gray-500"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition"
                aria-label="Tozalash"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-[10px] sm:text-xs font-semibold text-gray-500 hover:text-white px-2 py-1 rounded border border-white/10"
            >
              ESC
            </button>
          </form>

          {/* Content — scrollable */}
          <div className="max-h-[65vh] overflow-y-auto">
            {/* Live search results */}
            {hasQuery && (
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <Search size={12} className="text-second" />
                  <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500">
                    {searching ? "Qidirilmoqda..." : "Natijalar"}
                  </span>
                </div>
                {searching ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-xl skeleton" />
                    ))}
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="py-8 text-center">
                    <Film className="mx-auto text-white/20 mb-2" size={32} />
                    <p className="text-sm text-gray-400">
                      &ldquo;{query}&rdquo; bo&apos;yicha natija topilmadi
                    </p>
                    <button
                      onClick={() => submit(query)}
                      className="mt-3 text-xs text-second font-semibold hover:underline"
                    >
                      Kengaytirilgan qidiruv →
                    </button>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-1">
                      {suggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => navigateToDrama(item.id)}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.05] text-left transition group"
                          >
                            <div className="relative w-12 h-16 shrink-0 rounded-md overflow-hidden bg-white/[0.04]">
                              {item.posterUrl ? (
                                <Image
                                  src={normalizeImageUrl(item.posterUrl)}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="text-white/20" size={16} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white truncate group-hover:text-second transition">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                {item.year && <span>{item.year}</span>}
                                {item.year && item.country && (
                                  <span className="text-gray-700">•</span>
                                )}
                                {item.country && <span>{item.country}</span>}
                                {item.totalEpisodes && (
                                  <>
                                    <span className="text-gray-700">•</span>
                                    <span>{item.totalEpisodes} qism</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <ArrowUpRight
                              className="text-gray-600 group-hover:text-second transition shrink-0"
                              size={14}
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => submit(query)}
                      className="w-full mt-2 py-2.5 text-xs sm:text-sm font-semibold text-second hover:bg-second/10 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      Barcha natijalarni ko&apos;rish
                      <ArrowUpRight size={14} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Search history (when empty query) */}
            {!hasQuery && history.length > 0 && (
              <div className="p-3 sm:p-4 border-b border-white/5">
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-second" />
                    <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500">
                      Qidiruv tarixi
                    </span>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] text-gray-500 hover:text-second transition"
                  >
                    Tozalash
                  </button>
                </div>
                <ul className="space-y-0.5">
                  {history.map((item) => (
                    <li key={item.query}>
                      <div className="group flex items-center gap-2 rounded-lg hover:bg-white/[0.05] transition">
                        <button
                          onClick={() => submit(item.query)}
                          className="flex-1 flex items-center gap-3 px-2 py-2 text-left"
                        >
                          <Clock
                            size={14}
                            className="text-gray-600 shrink-0"
                          />
                          <span className="text-sm text-white/85 truncate group-hover:text-white">
                            {item.query}
                          </span>
                        </button>
                        <button
                          onClick={(e) => handleRemoveHistory(e, item.query)}
                          className="mr-2 w-6 h-6 rounded-full flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                          aria-label="O'chirish"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trending dramas (when empty query) */}
            {!hasQuery && trending.length > 0 && (
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 px-2 mb-3">
                  <TrendingUp size={12} className="text-second" />
                  <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500">
                    Hozir mashhur
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {trending.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigateToDrama(item.id)}
                      className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.05] text-left transition"
                    >
                      <div className="relative w-11 h-14 sm:w-12 sm:h-16 shrink-0 rounded-md overflow-hidden bg-white/[0.04]">
                        {item.posterUrl ? (
                          <Image
                            src={normalizeImageUrl(item.posterUrl)}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="text-white/20" size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-second transition">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {item.year || ""}
                          {item.country ? ` • ${item.country}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state when no history/trending */}
            {!hasQuery && history.length === 0 && trending.length === 0 && (
              <div className="py-16 text-center">
                <Search className="mx-auto text-white/20 mb-3" size={32} />
                <p className="text-sm text-gray-400">
                  Film, serial yoki aktyor nomini kiriting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
