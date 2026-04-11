"use client";

import { useState, useEffect } from "react";
import { getActors, searchActors, type ActorItem, type Pagination } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../components/BreadCrumb";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function AktyorlarPage() {
  const [actors, setActors] = useState<ActorItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchActors = async (p: number) => {
    setLoading(true);
    try {
      const data = await getActors(p, 30);
      setActors(data.items);
      setTotalPages(data.pagination.totalPages);
      setPage(p);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    if (!q.trim()) {
      fetchActors(1);
      return;
    }
    setSearching(true);
    try {
      const data = await searchActors(q.trim(), 1, 60);
      setActors(data.items);
      setTotalPages(1);
      setPage(1);
    } catch {
      // error
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchActors(1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h1 className="font-second font-semibold text-2xl sm:text-3xl md:text-4xl">
          Aktyorlar
        </h1>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Aktyor qidirish..."
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none focus:border-second/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
            >
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {loading || searching ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 skeleton rounded-full mb-2" />
              <div className="w-16 h-3 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : actors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-3">🎭</p>
          <p className="text-gray-400">
            {searchQuery ? `"${searchQuery}" bo'yicha aktyor topilmadi` : "Aktyorlar topilmadi"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {actors.map((actor) => (
              <Link
                key={actor.id}
                href={`/aktyorlar/${actor.id}`}
                className="group text-center space-y-2"
              >
                <div className="relative aspect-square rounded-full overflow-hidden mx-auto w-full max-w-[140px] border-2 border-white/10 group-hover:border-second/50 transition">
                  {actor.actorImg ? (
                    <Image src={actor.actorImg} alt={actor.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white/30">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-white transition truncate">{actor.name}</p>
                  {actor.dramaCount !== undefined && (
                    <p className="text-xs text-gray-500">{actor.dramaCount} drama</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {!searchQuery && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <button
                  onClick={() => fetchActors(page - 1)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  Oldingi
                </button>
              )}
              <span className="px-4 py-2 text-sm text-gray-400">{page} / {totalPages}</span>
              {page < totalPages && (
                <button
                  onClick={() => fetchActors(page + 1)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  Keyingi
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
