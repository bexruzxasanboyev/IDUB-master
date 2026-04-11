"use client";

import { useState, useEffect } from "react";
import { getPlans, getPremiumFeatures, getSubscription, type Plan, type PremiumFeature, type SubscriptionInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Breadcrumb from "../components/BreadCrumb";
import { FaCrown, FaCheck, FaCalendarAlt } from "react-icons/fa";

export default function ObunaPage() {
  const { user, token } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises: Promise<unknown>[] = [
      getPlans().catch(() => ({ plans: [] })),
      getPremiumFeatures().catch(() => ({ features: [] })),
    ];
    if (token) {
      promises.push(getSubscription(token).catch(() => null));
    }

    Promise.all(promises).then(([plansData, featuresData, subData]) => {
      setPlans((plansData as { plans: Plan[] }).plans);
      setFeatures((featuresData as { features: PremiumFeature[] }).features);
      if (subData) setSubscription(subData as SubscriptionInfo);
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          <FaCrown className="inline text-yellow-400 mr-2" />
          Premium Obuna
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">Cheklanmagan kontentdan bahramand bo&apos;ling</p>
      </div>

      {/* Current subscription */}
      {subscription?.isActive && (
        <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-second/15 to-purple-500/10 border border-second/20 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <FaCrown className="text-yellow-400 text-xl" />
            <div>
              <h3 className="font-bold text-lg">Sizning obunangiz: {subscription.plan?.title}</h3>
              <p className="text-sm text-gray-400">Faol obuna</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {subscription.startsAt && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <FaCalendarAlt className="text-xs" />
                Boshlanish: {new Date(subscription.startsAt).toLocaleDateString("uz")}
              </div>
            )}
            {subscription.expiresAt && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <FaCalendarAlt className="text-xs" />
                Tugash: {new Date(subscription.expiresAt).toLocaleDateString("uz")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-2xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <FaCheck className="text-second mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-sm">{f.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plans */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.isActive && subscription.plan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-surface border rounded-2xl p-5 sm:p-6 text-center hover:border-second/30 transition relative overflow-hidden ${
                  isCurrentPlan ? "border-second/50 ring-1 ring-second/20" : "border-white/5"
                }`}
              >
                {plan.code === "premium" && (
                  <div className="absolute top-0 right-0 bg-second text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    MASHHUR
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl">
                    JORIY
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{plan.title}</h3>
                <p className="text-3xl font-black text-second mb-1">
                  {plan.price.toLocaleString()} <span className="text-sm font-normal text-gray-400">so&apos;m</span>
                </p>
                <p className="text-xs text-gray-500 mb-4">{plan.durationDays} kun</p>

                {plan.benefits && plan.benefits.length > 0 && (
                  <ul className="space-y-2 mb-5 text-left">
                    {plan.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <FaCheck className="text-second mt-0.5 text-[10px] shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                {plan.capabilities && plan.capabilities.length > 0 && (
                  <ul className="space-y-1 mb-4 text-left">
                    {plan.capabilities.map((c, i) => (
                      <li key={i} className="text-[11px] text-gray-500 pl-4">- {c}</li>
                    ))}
                  </ul>
                )}

                <button
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition active:scale-[0.98] ${
                    isCurrentPlan
                      ? "bg-green-500/15 text-green-400 cursor-default"
                      : "bg-second hover:bg-second/85"
                  }`}
                >
                  {isCurrentPlan ? "Joriy plan" : "Tanlash"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
