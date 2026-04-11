"use client";

import { useState, useEffect } from "react";
import { getTips, getLegalLinks, type Tip } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import { FaLightbulb, FaExternalLinkAlt } from "react-icons/fa";

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [legalLinks, setLegalLinks] = useState<{ termsUrl: string; privacyUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTips().catch(() => ({ items: [] })),
      getLegalLinks().catch(() => null),
    ])
      .then(([tipsData, legal]) => {
        setTips(tipsData.items);
        setLegalLinks(legal);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-second rounded-full" />
        Maslahatlar
      </h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      ) : tips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">💡</p>
          <p className="text-gray-400">Hozircha maslahatlar yo&apos;q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="bg-white/[0.03] border border-white/5 rounded-xl p-4 sm:p-5 hover:bg-white/[0.05] transition"
            >
              <div className="flex items-start gap-3">
                <FaLightbulb className="text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base mb-1">{tip.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{tip.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legal links */}
      {legalLinks && (
        <div className="mt-10 pt-6 border-t border-white/5">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-second rounded-full" />
            Huquqiy ma&apos;lumotlar
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={legalLinks.termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm hover:bg-white/[0.06] transition"
            >
              Foydalanish shartlari <FaExternalLinkAlt className="text-[10px] text-gray-500" />
            </a>
            <a
              href={legalLinks.privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-sm hover:bg-white/[0.06] transition"
            >
              Maxfiylik siyosati <FaExternalLinkAlt className="text-[10px] text-gray-500" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
