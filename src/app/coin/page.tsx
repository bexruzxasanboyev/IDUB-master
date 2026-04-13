"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getCoins,
  getCoinTransactions,
  claimAdReward,
  claimShareReward,
  claimWelcomeBonus,
  claimVipDaily,
  claimSocialReward,
  claimNotificationReward,
  getCoinPackages,
  purchaseCoinPackage,
  type CoinInfo,
  type CoinTransaction,
  type CoinPackage,
} from "@/lib/api";
import { formatDateTime } from "@/lib/date-format";
import Breadcrumb from "../components/BreadCrumb";
import EmptyState from "../components/EmptyState";
import {
  Coins,
  Gift,
  Megaphone,
  Share2,
  Crown,
  Instagram,
  Send,
  Youtube,
  BellRing,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type EarnMethod = {
  key: string;
  icon: LucideIcon;
  label: string;
  description: string;
};

const EARN_METHODS: EarnMethod[] = [
  { key: "welcome", icon: Gift, label: "Kunlik bonus", description: "Har kuni ochiladi" },
  { key: "vip", icon: Crown, label: "VIP bonus", description: "Faqat obunachilar uchun" },
  { key: "ad", icon: Megaphone, label: "Reklama ko'rish", description: "Qisqa reklama uchun" },
  { key: "share", icon: Share2, label: "Ulashish", description: "Do'stlaringizga yuboring" },
  { key: "notification", icon: BellRing, label: "Bildirishnoma", description: "Ruxsat bering" },
  { key: "instagram", icon: Instagram, label: "Instagram", description: "Bizni kuzating" },
  { key: "telegram", icon: Send, label: "Telegram", description: "Kanalga a'zo bo'ling" },
  { key: "youtube", icon: Youtube, label: "YouTube", description: "Kanalga obuna bo'ling" },
];

export default function CoinPage() {
  const router = useRouter();
  const { user, token, loading, setUser } = useAuth();
  const [coinInfo, setCoinInfo] = useState<CoinInfo | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(false);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [fetching, setFetching] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    setFetching(true);
    Promise.all([
      getCoins(token),
      getCoinTransactions(token, 1, 20),
      getCoinPackages(token),
    ])
      .then(([coins, txData, pkgData]) => {
        setCoinInfo(coins);
        setTransactions(txData.items);
        setTxHasMore(txData.pagination.hasNext);
        setPackages(pkgData.packages);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const loadMoreTx = async () => {
    if (!token) return;
    const nextPage = txPage + 1;
    try {
      const txData = await getCoinTransactions(token, nextPage, 20);
      setTransactions((prev) => [...prev, ...txData.items]);
      setTxPage(nextPage);
      setTxHasMore(txData.pagination.hasNext);
    } catch {
      // ignore
    }
  };

  const claim = async (type: string) => {
    if (!token || claiming) return;
    setClaiming(type);
    try {
      let result;
      if (type === "ad") result = await claimAdReward(token);
      else if (type === "share") result = await claimShareReward(token);
      else if (type === "welcome") result = await claimWelcomeBonus(token);
      else if (type === "vip") result = await claimVipDaily(token);
      else if (type === "notification") result = await claimNotificationReward(token);
      else if (type === "instagram" || type === "telegram" || type === "youtube") {
        result = await claimSocialReward(token, type);
      }
      if (result) {
        setCoinInfo((prev) => (prev ? { ...prev, balance: result!.newBalance } : prev));
        if (user) setUser({ ...user, coin: result.newBalance });
      }
    } catch {
      // already claimed or error
    } finally {
      setClaiming(null);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!token || purchasing) return;
    setPurchasing(packageId);
    try {
      const result = await purchaseCoinPackage(token, packageId);
      setCoinInfo((prev) => (prev ? { ...prev, balance: result.newBalance } : prev));
      if (user) setUser({ ...user, coin: result.newBalance });
    } catch {
      // error
    } finally {
      setPurchasing(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-main text-white pt-24 sm:pt-28 md:pt-32 pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-32 rounded skeleton mb-6" />
          <div className="h-44 w-full rounded-3xl skeleton mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const balance = coinInfo?.balance ?? user?.coin ?? 0;
  const canClaimDaily = coinInfo?.dailyReward && !coinInfo.dailyReward.claimed;

  return (
    <div className="relative min-h-screen bg-main text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden">
        <div className="absolute left-1/2 -top-32 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(126,84,230,0.1),transparent_70%)]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20">
        <Breadcrumb />

        {/* Balance card */}
        {fetching ? (
          <div className="h-48 sm:h-52 rounded-3xl skeleton mb-10 sm:mb-12" />
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-second/25 bg-gradient-to-br from-second/[0.15] via-second/[0.06] to-transparent p-6 sm:p-8 md:p-10 mb-10 sm:mb-12">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-second/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-second/10 blur-3xl pointer-events-none" />

            <div className="relative flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-second/15 border border-second/25 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <Coins className="text-second" size={28} strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-second font-semibold uppercase tracking-widest mb-1.5">
                    Coin balansi
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight">
                      {balance.toLocaleString()}
                    </span>
                    <span className="text-sm sm:text-base text-gray-400 font-semibold">
                      coin
                    </span>
                  </div>
                  {canClaimDaily && (
                    <p className="mt-2 text-xs sm:text-sm text-second/90 font-semibold flex items-center gap-1.5">
                      <Sparkles size={13} />
                      Kunlik mukofot mavjud
                    </p>
                  )}
                </div>
              </div>

              <a
                href="#packages"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-second text-white rounded-xl font-semibold text-sm hover:bg-second/85 transition-all duration-300 active:scale-95 shadow-[0_8px_30px_rgba(126,84,230,0.3)]"
              >
                <Plus size={15} />
                Coin qo&apos;shish
              </a>
            </div>
          </div>
        )}

        {/* Earn methods */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
            <div className="w-1 h-6 sm:h-7 bg-second rounded-full" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Bepul coin yig&apos;ish
            </h2>
          </div>

          {fetching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {EARN_METHODS.map((item) => {
                const isBusy = claiming === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => claim(item.key)}
                    disabled={isBusy || !!claiming}
                    className="group relative flex flex-col items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 text-left hover:border-second/30 hover:bg-white/[0.04] transition-all duration-300 disabled:opacity-50 active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-second/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-second/10 border border-second/20 flex items-center justify-center group-hover:bg-second/15 group-hover:border-second/30 transition-all duration-300">
                      <item.icon
                        className="text-second"
                        size={18}
                        strokeWidth={1.8}
                      />
                    </div>
                    <div className="relative min-w-0 w-full">
                      <p className="text-sm sm:text-base font-bold text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    {isBusy && (
                      <div className="absolute top-3 right-3 w-4 h-4 border-2 border-second border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Packages */}
        {!fetching && packages.length > 0 && (
          <section id="packages" className="mb-10 sm:mb-14 scroll-mt-28">
            <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
              <div className="w-1 h-6 sm:h-7 bg-second rounded-full" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Coin sotib olish
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {packages.map((pkg) => {
                const isBusy = purchasing === pkg.id;
                const isFeatured = !!pkg.label;
                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                      isFeatured
                        ? "bg-gradient-to-b from-second/[0.1] to-second/[0.02] border-2 border-second/30 hover:border-second/50"
                        : "bg-white/[0.02] border border-white/10 hover:border-second/30 hover:bg-white/[0.04]"
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-second text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_6px_20px_rgba(126,84,230,0.35)]">
                        {pkg.label}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 mt-1">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-second/10 border border-second/25 flex items-center justify-center">
                        <Coins className="text-second" size={20} strokeWidth={1.8} />
                      </div>
                      {pkg.bonus ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-second/10 border border-second/20 text-second rounded-md text-[10px] font-bold">
                          <Sparkles size={10} />+{pkg.bonus}
                        </span>
                      ) : null}
                    </div>

                    <div className="mb-1">
                      <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                        {pkg.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold">coin</p>
                    </div>

                    <div className="mt-auto pt-5 border-t border-white/5">
                      <p className="text-lg sm:text-xl font-black text-white mb-3">
                        {pkg.price.toLocaleString()}{" "}
                        <span className="text-xs font-semibold text-gray-500">
                          so&apos;m
                        </span>
                      </p>
                      <button
                        onClick={() => handlePurchase(pkg.id)}
                        disabled={isBusy || !!purchasing}
                        className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 active:scale-[0.98] disabled:opacity-50 ${
                          isFeatured
                            ? "bg-second text-white hover:bg-second/85 shadow-[0_8px_30px_rgba(126,84,230,0.25)]"
                            : "bg-white/[0.05] border border-white/10 text-white hover:bg-second hover:border-second hover:shadow-[0_8px_30px_rgba(126,84,230,0.25)]"
                        }`}
                      >
                        {isBusy ? "Sotib olinmoqda..." : "Sotib olish"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Transactions */}
        <section>
          <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
            <div className="w-1 h-6 sm:h-7 bg-second rounded-full" />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Tranzaksiyalar tarixi
            </h2>
          </div>

          {fetching ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl skeleton" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              variant="generic"
              title="Hali tranzaksiyalar yo'q"
              description="Coin yig'gan yoki sarflaganingizda bu yerda ko'rinadi"
              compact
            />
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <ul className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const positive = tx.amount > 0;
                  return (
                    <li
                      key={tx.id}
                      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-white/[0.02] transition-colors duration-200"
                    >
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border ${
                          positive
                            ? "bg-second/10 border-second/25 text-second"
                            : "bg-white/[0.04] border-white/10 text-gray-400"
                        }`}
                      >
                        {positive ? (
                          <TrendingUp size={14} strokeWidth={2} />
                        ) : (
                          <TrendingDown size={14} strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {tx.description || (positive ? "Qo'shildi" : "Sarflandi")}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`text-sm sm:text-base font-black tabular-nums flex items-center gap-0.5 shrink-0 ${
                          positive ? "text-second" : "text-gray-400"
                        }`}
                      >
                        {positive ? <Plus size={12} /> : <Minus size={12} />}
                        {Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {txHasMore && (
                <button
                  onClick={loadMoreTx}
                  className="w-full py-3 text-xs sm:text-sm font-semibold text-second hover:bg-second/10 border-t border-white/5 transition flex items-center justify-center gap-1.5"
                >
                  Ko&apos;proq ko&apos;rsatish
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
