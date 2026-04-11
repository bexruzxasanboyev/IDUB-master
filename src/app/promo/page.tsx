"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { redeemPromo } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import { FaTicketAlt, FaCheck } from "react-icons/fa";

export default function PromoPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: string; message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const handleRedeem = async () => {
    if (!code.trim() || !token) return;
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const data = await redeemPromo(token, code.trim());
      setResult({ type: data.type, message: data.message });
      setCode("");
    } catch (err: any) {
      setError(err.message || "Promo kod noto'g'ri yoki muddati o'tgan");
    } finally {
      setSubmitting(false);
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

      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <FaTicketAlt className="text-4xl text-second mx-auto mb-3" />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Promo Kod</h1>
          <p className="text-gray-400 text-sm">Promo kodni kiriting va sovg&apos;angizni oling</p>
        </div>

        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <FaCheck className="text-green-400 shrink-0" />
            <p className="text-sm text-green-400">{result.message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="PROMO123"
            className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-wider placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal outline-none focus:border-second/60 transition uppercase"
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
          />
          <button
            onClick={handleRedeem}
            disabled={submitting || !code.trim()}
            className="px-6 py-3.5 bg-second rounded-xl font-bold hover:bg-second/85 transition active:scale-[0.98] disabled:opacity-50 shrink-0"
          >
            {submitting ? "..." : "Qo'llash"}
          </button>
        </div>
      </div>
    </div>
  );
}
