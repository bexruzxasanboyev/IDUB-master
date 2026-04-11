"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getDownloads, deleteDownload, type DownloadItem } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import { FaTrash, FaPlay } from "react-icons/fa";

export default function DownloadsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getDownloads(token)
      .then((data) => setItems(data.items))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deleteDownload(token, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      // ignore
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-2 border-second border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-second rounded-full" />
        Yuklanganlar
      </h1>

      {fetching ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">📥</p>
          <h3 className="text-xl font-medium mb-2">Hech narsa yuklanmagan</h3>
          <p className="text-gray-500 text-sm">Dramalarni yuklab oling va offlayn ko&apos;ring</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 sm:gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-3 sm:p-4 hover:bg-white/[0.05] transition"
            >
              {item.drama?.posterUrl && (
                <Link href={`/movie/${item.drama.id}`} className="shrink-0">
                  <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden">
                    <Image src={item.drama.posterUrl} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                      <FaPlay className="text-white text-xs" />
                    </div>
                  </div>
                </Link>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">
                  {item.drama?.title || "Drama"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sifat: {item.quality} &middot; {new Date(item.downloadedAt).toLocaleDateString("uz")}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
