"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getCoins, getCoinTransactions, claimAdReward, claimShareReward,
  claimWelcomeBonus, claimVipDaily, claimSocialReward, claimNotificationReward,
  getCoinPackages, purchaseCoinPackage,
  type CoinInfo, type CoinTransaction, type CoinPackage,
} from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import { FaCoins, FaGift, FaAd, FaShareAlt, FaCrown, FaInstagram, FaTelegram, FaYoutube, FaBell } from "react-icons/fa";

export default function CoinPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
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
        setCoinInfo((prev) => prev ? { ...prev, balance: result.newBalance } : prev);
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
      setCoinInfo((prev) => prev ? { ...prev, balance: result.newBalance } : prev);
    } catch {
      // error
    } finally {
      setPurchasing(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-2 border-second border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const earnMethods = [
    { key: "ad", icon: FaAd, label: "Reklama ko'rish", color: "text-blue-400" },
    { key: "share", icon: FaShareAlt, label: "Ulashish", color: "text-green-400" },
    { key: "welcome", icon: FaGift, label: "Kunlik bonus", color: "text-orange-400" },
    { key: "vip", icon: FaCrown, label: "VIP bonus", color: "text-purple-400" },
    { key: "notification", icon: FaBell, label: "Bildirishnoma ruxsati", color: "text-red-400" },
    { key: "instagram", icon: FaInstagram, label: "Instagram obuna", color: "text-pink-400" },
    { key: "telegram", icon: FaTelegram, label: "Telegram obuna", color: "text-sky-400" },
    { key: "youtube", icon: FaYoutube, label: "YouTube obuna", color: "text-red-500" },
  ];

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />

      {/* Balance */}
      <div className="bg-gradient-to-r from-second/20 to-yellow-500/10 border border-second/20 rounded-2xl p-5 sm:p-6 text-center mb-6">
        <FaCoins className="text-yellow-400 text-3xl mx-auto mb-2" />
        <p className="text-sm text-gray-400">Sizning balansingiz</p>
        <p className="text-3xl sm:text-4xl font-black">{coinInfo?.balance?.toLocaleString() ?? 0}</p>
        <p className="text-xs text-gray-500 mt-1">coin</p>
        {coinInfo?.dailyReward && !coinInfo.dailyReward.claimed && (
          <p className="text-xs text-green-400 mt-2">Kunlik mukofotni olishingiz mumkin!</p>
        )}
      </div>

      {/* Earn */}
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-5 bg-second rounded-full" /> Coin yig&apos;ish
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-6">
        {earnMethods.map((item) => (
          <button
            key={item.key}
            onClick={() => claim(item.key)}
            disabled={claiming === item.key}
            className="flex flex-col items-center gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.06] transition disabled:opacity-50"
          >
            <item.icon className={`text-xl ${item.color}`} />
            <span className="text-xs font-medium text-center">{item.label}</span>
            {claiming === item.key && (
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        ))}
      </div>

      {/* Packages */}
      {packages.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-second rounded-full" /> Coin sotib olish
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-surface border border-white/5 rounded-xl p-4 text-center hover:border-second/30 transition">
                <p className="text-2xl font-black text-yellow-400">{pkg.amount}</p>
                {pkg.bonus && <p className="text-[10px] text-green-400">+{pkg.bonus} bonus</p>}
                {pkg.label && <p className="text-[10px] text-second mt-0.5">{pkg.label}</p>}
                <p className="text-sm font-bold mt-2">{pkg.price.toLocaleString()} so&apos;m</p>
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={purchasing === pkg.id}
                  className="w-full mt-3 py-2 bg-second/20 border border-second/20 rounded-lg text-xs font-medium text-second hover:bg-second/30 transition disabled:opacity-50"
                >
                  {purchasing === pkg.id ? "..." : "Sotib olish"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-second rounded-full" /> Tarix
          </h2>
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-4 bg-white/[0.02] rounded-lg">
                <div>
                  <p className="text-sm">{tx.description}</p>
                  <p className="text-[10px] text-gray-500">{new Date(tx.createdAt).toLocaleDateString("uz")}</p>
                </div>
                <span className={`font-bold text-sm ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </span>
              </div>
            ))}
          </div>
          {txHasMore && (
            <button
              onClick={loadMoreTx}
              className="w-full mt-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition"
            >
              Ko&apos;proq ko&apos;rsatish
            </button>
          )}
        </>
      )}
    </div>
  );
}
