"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { addFavoriteActor, removeFavoriteActor, getFavoriteActors } from "@/lib/api";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function FavoriteButton({ actorId }: { actorId: string }) {
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    getFavoriteActors(token)
      .then((data) => {
        const found = data.actors.some((a) => a.id === actorId);
        setIsFavorite(found);
      })
      .catch(() => {});
  }, [token, actorId]);

  const toggle = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      if (isFavorite) {
        await removeFavoriteActor(token, actorId);
      } else {
        await addFavoriteActor(token, actorId);
      }
      setIsFavorite(!isFavorite);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`mt-3 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 ${
        isFavorite
          ? "bg-red-500/15 border border-red-500/20 text-red-400 hover:bg-red-500/25"
          : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
      }`}
    >
      {isFavorite ? <FaHeart className="text-red-400 text-xs" /> : <FaRegHeart className="text-xs" />}
      {isFavorite ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
    </button>
  );
}
