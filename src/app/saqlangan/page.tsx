"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getSaved, bulkRemoveSaved, type SavedItem } from "@/lib/api";
import { useSaved } from "@/lib/saved-context";
import Card from "../components/Card";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";

export default function SaqlanganPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const { toggleSaved, markUnsaved } = useSaved();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getSaved(token)
      .then((data) => setItems(data.items))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const handleRemove = async (dramaId: string) => {
    if (!token) return;
    setItems((prev) => prev.filter((d) => d.dramaId !== dramaId));
    await toggleSaved(dramaId);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((d) => d.dramaId)));
    }
  };

  const handleBulkRemove = async () => {
    if (!token || selected.size === 0) return;
    setDeleting(true);
    try {
      const ids = Array.from(selected);
      await bulkRemoveSaved(token, ids);
      ids.forEach((id) => markUnsaved(id));
      setItems((prev) => prev.filter((d) => !selected.has(d.dramaId)));
      setSelected(new Set());
      setSelectMode(false);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h1 className="font-second font-semibold text-xl sm:text-3xl md:text-4xl">
          Saqlangan dramalar
        </h1>
        {items.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectMode ? (
              <>
                <button
                  onClick={selectAll}
                  className="text-xs text-gray-400 hover:text-white transition"
                >
                  {selected.size === items.length ? "Bekor qilish" : "Hammasini tanlash"}
                </button>
                <button
                  onClick={handleBulkRemove}
                  disabled={selected.size === 0 || deleting}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/25 transition disabled:opacity-50"
                >
                  <FaTrash className="text-[10px]" /> {deleting ? "..." : `O'chirish (${selected.size})`}
                </button>
                <button
                  onClick={() => { setSelectMode(false); setSelected(new Set()); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition"
                >
                  <FaTimes className="text-[10px]" /> Bekor
                </button>
              </>
            ) : (
              <button
                onClick={() => setSelectMode(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                <FaCheck className="text-[10px]" /> Tanlash
              </button>
            )}
          </div>
        )}
      </div>

      {fetching ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          variant="saved"
          title="Hali hech narsa saqlanmagan"
          description="Drama yoki filmlarni saqlang va bu yerda kolleksiyangizni yig'ing"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {items.map((item, index) => (
            <div key={`${item.dramaId}-${index}`} className="relative group/card">
              {selectMode && (
                <button
                  onClick={() => toggleSelect(item.dramaId)}
                  className={`absolute top-2 left-2 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    selected.has(item.dramaId)
                      ? "bg-second border-second"
                      : "border-white/40 bg-black/40"
                  }`}
                >
                  {selected.has(item.dramaId) && <FaCheck className="text-white text-[8px]" />}
                </button>
              )}
              <Card
                id={item.dramaId}
                title={item.drama.title}
                poster={item.drama.posterUrl}
                genres={item.drama.genres?.map((g) => g.title)}
              />
              {!selectMode && (
                <button
                  onClick={() => handleRemove(item.dramaId)}
                  className="absolute top-2 left-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 group-hover/card:opacity-100 transition hover:bg-red-600"
                  aria-label="O'chirish"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
