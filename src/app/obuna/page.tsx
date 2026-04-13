"use client";

import { useState, useEffect } from "react";
import {
  getPlans,
  getPremiumFeatures,
  getSubscription,
  type Plan,
  type PremiumFeature,
  type SubscriptionInfo,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Breadcrumb from "../components/BreadCrumb";
import { FaCrown, FaCheck, FaCalendarAlt } from "react-icons/fa";

function formatDate(date?: string) {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("uz", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function capabilitiesToList(cap?: Plan["capabilities"]): string[] {
  if (!cap) return [];
  const items: string[] = [];
  if (cap.maxQuality) items.push(`Sifat: ${cap.maxQuality}`);
  if (cap.noAds) items.push("Reklamasiz tomosha");
  if (cap.canDownload) items.push("Offline yuklab olish");
  if (cap.canShare) items.push("Do'stlar bilan ulashish");
  if (cap.canGift) items.push("Sovg'a qilish imkoniyati");
  if (cap.offlineExpiresHours != null) {
    items.push(`Offline: ${cap.offlineExpiresHours} soat`);
  }
  return items;
}

function monthlyPrice(plan: Plan): number | null {
  if (!plan.periodDays || plan.periodDays <= 0) return null;
  const months = plan.periodDays / 30;
  if (months <= 0) return null;
  return Math.round(plan.price / months);
}

export default function ObunaPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      const [plansRes, featuresRes, subRes] = await Promise.all([
        getPlans().catch(() => ({ plans: [] as Plan[] })),
        getPremiumFeatures().catch(() => ({ items: [] as PremiumFeature[] })),
        token ? getSubscription(token).catch(() => null) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      setPlans(plansRes?.plans ?? []);
      setFeatures(featuresRes?.items ?? []);
      setSubscription(subRes);
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const hasActiveSub = subscription != null;

  return (
    <div className="relative min-h-screen bg-main text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden">
        <div className="absolute left-1/2 -top-32 -translate-x-1/2 w-[1200px] h-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(126,84,230,0.12),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
        <Breadcrumb />

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-second/10 border border-second/20 text-second text-xs sm:text-sm font-semibold mb-5 sm:mb-6">
            <FaCrown className="text-[11px]" />
            PREMIUM OBUNA
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 sm:mb-5 leading-[1.05]">
            Cheksiz tomosha
            <br className="hidden sm:block" />
            <span className="text-second"> yangi tajriba</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Reklamasiz, yuqori sifatda, istalgan vaqtda. O&apos;zingizga mos rejani tanlang va
            premium kontentdan bahramand bo&apos;ling.
          </p>
        </div>

        {/* Current subscription */}
        {hasActiveSub && (
          <div className="max-w-3xl mx-auto mb-10 sm:mb-14 relative rounded-2xl overflow-hidden border border-second/20 bg-gradient-to-r from-second/[0.08] via-second/[0.04] to-transparent">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(126,84,230,0.15),transparent_70%)] pointer-events-none" />
            <div className="relative p-5 sm:p-6 md:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-second/15 border border-second/25 flex items-center justify-center shrink-0">
                <FaCrown className="text-second text-xl sm:text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-second font-semibold uppercase tracking-widest mb-1">
                  Faol obuna
                </p>
                <h3 className="font-black text-xl sm:text-2xl tracking-tight mb-2">
                  {subscription?.plan?.title}
                </h3>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs sm:text-sm text-gray-400">
                  {subscription?.startAt && (
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-[10px] text-second" />
                      <span>
                        Boshlangan: <span className="text-white/80">{formatDate(subscription.startAt)}</span>
                      </span>
                    </div>
                  )}
                  {subscription?.endAt && (
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt className="text-[10px] text-second" />
                      <span>
                        Tugaydi: <span className="text-white/80">{formatDate(subscription.endAt)}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features grid */}
        {features.length > 0 && (
          <div className="mb-12 sm:mb-16 md:mb-20">
            <div className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8">
              <div className="w-1 h-5 sm:h-6 bg-second rounded-full" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                Premium bilan nima olasiz
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
              {features.map((f) => (
                <div
                  key={f.id}
                  className="group flex items-start gap-3 sm:gap-4 bg-white/[0.02] border border-white/5 hover:border-second/25 hover:bg-white/[0.04] rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-second/10 border border-second/20 flex items-center justify-center shrink-0 group-hover:bg-second/15 transition-colors duration-300">
                    <FaCheck className="text-second text-xs sm:text-sm" />
                  </div>
                  <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-1.5">
                    {f.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8">
            <div className="w-1 h-5 sm:h-6 bg-second rounded-full" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
              Rejani tanlang
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] bg-white/[0.03] border border-white/5 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-14 max-w-2xl mx-auto">
              <p className="text-gray-400 text-sm">
                Hozircha faol obuna rejalari mavjud emas
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                plans.length >= 3 ? "lg:grid-cols-3" : ""
              } gap-4 sm:gap-5 lg:gap-6 max-w-6xl mx-auto`}
            >
              {plans.map((plan) => {
                const isCurrent = hasActiveSub && subscription?.plan?.id === plan.id;
                const isPopular = plan.code === "premium" || plans.length === 1;
                const capabilityItems = capabilitiesToList(plan.capabilities);
                const perMonth = monthlyPrice(plan);
                const showPerMonth = perMonth != null && plan.periodDays > 30;

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-3xl p-6 sm:p-7 md:p-8 transition-all duration-300 ${
                      isPopular
                        ? "bg-gradient-to-b from-second/[0.08] to-second/[0.02] border-2 border-second/30 hover:border-second/50 lg:scale-[1.03] shadow-[0_20px_80px_rgba(126,84,230,0.15)]"
                        : "bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                    } ${isCurrent ? "ring-2 ring-second/40" : ""}`}
                  >
                    {/* Top badges */}
                    {isCurrent ? (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-second text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(126,84,230,0.35)]">
                        Joriy reja
                      </div>
                    ) : (
                      isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-second text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(126,84,230,0.35)]">
                          Tavsiya etiladi
                        </div>
                      )
                    )}

                    {/* Title */}
                    <div className="mb-5 sm:mb-6 pt-2">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                        {plan.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {plan.periodDays} kunlik obuna
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 sm:mb-7 pb-6 sm:pb-7 border-b border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                          {plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm sm:text-base font-semibold text-gray-400">
                          {plan.currency || "so'm"}
                        </span>
                      </div>
                      {showPerMonth && (
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-1.5">
                          ≈ {perMonth?.toLocaleString()} so&apos;m / oy
                        </p>
                      )}
                    </div>

                    {/* Benefits */}
                    <div className="flex-1 space-y-3 mb-7 sm:mb-8">
                      {plan.benefits && plan.benefits.length > 0 && (
                        <ul className="space-y-2.5">
                          {plan.benefits.map((b) => (
                            <li
                              key={b.id}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-200"
                            >
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-second/10 border border-second/20 flex items-center justify-center shrink-0 mt-0.5">
                                <FaCheck className="text-second text-[7px] sm:text-[9px]" />
                              </div>
                              <span className="leading-snug">{b.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {capabilityItems.length > 0 && (
                        <ul className="space-y-2 pt-2">
                          {capabilityItems.map((c, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-400"
                            >
                              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                                <FaCheck className="text-white/50 text-[7px] sm:text-[9px]" />
                              </div>
                              <span className="leading-snug">{c}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      disabled={isCurrent}
                      className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 active:scale-[0.98] ${
                        isCurrent
                          ? "bg-second/10 border border-second/25 text-second cursor-default"
                          : isPopular
                            ? "bg-second text-white hover:bg-second/85 shadow-[0_8px_30px_rgba(126,84,230,0.3)] hover:shadow-[0_12px_40px_rgba(126,84,230,0.4)]"
                            : "bg-white/[0.04] border border-white/10 text-white hover:bg-second hover:border-second hover:text-white hover:shadow-[0_8px_30px_rgba(126,84,230,0.3)]"
                      }`}
                    >
                      {isCurrent ? "Joriy reja" : "Rejani tanlash"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] sm:text-xs text-gray-500 max-w-md mx-auto">
          Istalgan vaqtda bekor qilishingiz mumkin. Obunangiz muddati tugaguncha davom etadi.
        </p>
      </div>
    </div>
  );
}
