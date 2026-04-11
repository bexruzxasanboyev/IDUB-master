"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGenres, type Genre } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";

const GENRE_COLORS = [
  "from-purple-600/30 to-purple-900/10 border-purple-500/20",
  "from-blue-600/30 to-blue-900/10 border-blue-500/20",
  "from-pink-600/30 to-pink-900/10 border-pink-500/20",
  "from-green-600/30 to-green-900/10 border-green-500/20",
  "from-yellow-600/30 to-yellow-900/10 border-yellow-500/20",
  "from-red-600/30 to-red-900/10 border-red-500/20",
  "from-cyan-600/30 to-cyan-900/10 border-cyan-500/20",
  "from-orange-600/30 to-orange-900/10 border-orange-500/20",
  "from-indigo-600/30 to-indigo-900/10 border-indigo-500/20",
  "from-teal-600/30 to-teal-900/10 border-teal-500/20",
];

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGenres()
      .then((data) => setGenres(data.genres))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-second rounded-full" />
        Janrlar
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {genres.map((genre, i) => (
            <Link
              key={genre.id}
              href={`/hammasi?genre=${genre.slug}`}
              className={`bg-gradient-to-br ${GENRE_COLORS[i % GENRE_COLORS.length]} border rounded-xl p-3.5 sm:p-5 md:p-6 hover:scale-[1.03] transition-all duration-300 group`}
            >
              <h3 className="text-base sm:text-lg font-bold group-hover:text-second transition-colors">
                {genre.title}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
