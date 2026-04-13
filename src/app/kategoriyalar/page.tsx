"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategories, type CategoryGroup } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";

export default function CategoriesPage() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((data) => setGroups(data.groups))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-second rounded-full" />
        Kategoriyalar
      </h1>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-6 w-40 skeleton rounded mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-14 skeleton rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          variant="catalog"
          title="Kategoriyalar topilmadi"
          description="Hozircha hech qanday kategoriya mavjud emas"
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.id}>
              <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-second rounded-full" />
                {group.title}
              </h2>
              {group.items && group.items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/hammasi?category=${item.slug}`}
                      className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 hover:bg-white/[0.06] hover:border-second/20 transition-all duration-200 text-sm font-medium"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Bu guruhda hozircha ma&apos;lumot yo&apos;q</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
