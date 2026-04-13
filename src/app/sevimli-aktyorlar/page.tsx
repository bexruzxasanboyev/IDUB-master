"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getFavoriteActors, removeFavoriteActor, normalizeImageUrl, type FavoriteActor } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";
import { FaHeart } from "react-icons/fa";

export default function FavoriteActorsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [actors, setActors] = useState<FavoriteActor[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getFavoriteActors(token)
      .then((data) => setActors(data.actors))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const handleRemove = async (actorId: string) => {
    if (!token) return;
    try {
      await removeFavoriteActor(token, actorId);
      setActors((prev) => prev.filter((a) => a.id !== actorId));
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
        Sevimli aktyorlar
      </h1>

      {fetching ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-20 h-20 skeleton rounded-full mb-2" />
              <div className="w-16 h-3 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : actors.length === 0 ? (
        <EmptyState
          variant="favorite-actors"
          title="Sevimli aktyorlar yo'q"
          description="Yoqtirgan aktyorlaringizni sevimlilarga qo'shing va ularning yangi loyihalaridan birinchi bo'lib xabardor bo'ling"
          action={
            <Link
              href="/aktyorlar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-second rounded-lg text-sm font-medium text-white hover:bg-second/85 transition active:scale-95 shadow-[0_8px_30px_rgba(126,84,230,0.25)]"
            >
              Aktyorlarni ko&apos;rish
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-5">
          {actors.map((actor) => (
            <div key={actor.id} className="flex flex-col items-center group">
              <Link href={`/aktyorlar/${actor.id}`} className="relative mb-2">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-second/50 transition">
                  {actor.actorImg ? (
                    <Image src={normalizeImageUrl(actor.actorImg)} alt={actor.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center text-2xl font-bold text-white/30">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                </div>
              </Link>
              <Link href={`/aktyorlar/${actor.id}`} className="text-sm font-medium text-center hover:text-second transition truncate max-w-full">
                {actor.name}
              </Link>
              <button
                onClick={() => handleRemove(actor.id)}
                className="mt-1 text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition"
              >
                <FaHeart className="text-[8px]" /> O&apos;chirish
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
