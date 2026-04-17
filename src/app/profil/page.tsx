"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  getSubscription, getGenres, updateProfile, updateAvatar, updateGenres, getUnreadCount,
  normalizeImageUrl,
  type SubscriptionInfo, type Genre,
} from "@/lib/api";
import { formatDateLong } from "@/lib/date-format";
import {
  FaUser, FaCrown, FaBookmark, FaHistory, FaBell, FaSignOutAlt,
  FaCalendarAlt, FaHeart, FaStar,
  FaPen, FaCamera, FaCheck, FaTimes, FaChevronRight, FaCoins, FaPlus,
} from "react-icons/fa";

const GENRES_STORAGE_KEY_PREFIX = "idub_user_genres_";

export default function ProfilPage() {
  const router = useRouter();
  const { user, token, loading, logout, setUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [editingGenres, setEditingGenres] = useState(false);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [savingGenres, setSavingGenres] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getSubscription(token).then(setSubscription).catch(() => {});
    getUnreadCount(token).then((data) => setUnreadCount(data.count)).catch(() => {});
    getGenres().then((data) => setAllGenres(data.genres)).catch(() => {});
  }, [token]);

  // Load genres from localStorage once per user
  const [savedGenres, setSavedGenres] = useState<string[]>([]);
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    try {
      const raw = localStorage.getItem(`${GENRES_STORAGE_KEY_PREFIX}${userId}`);
      const parsed: string[] = raw ? JSON.parse(raw) : [];
      setSavedGenres(parsed);
      setSelectedGenres(parsed);
    } catch {
      setSavedGenres([]);
      setSelectedGenres([]);
    }
  }, [userId]);

  // Initialize edit fields ONCE per user (not on every user object change)
  useEffect(() => {
    if (!userId || !user) return;
    setEditName(user.name || "");
    setEditBirthDate(user.birthDate ? user.birthDate.slice(0, 10) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const resetEditFields = useCallback(() => {
    if (!user) return;
    setEditName(user.name || "");
    setEditBirthDate(user.birthDate ? user.birthDate.slice(0, 10) : "");
    setSaveError("");
  }, [user]);

  const handleSaveProfile = async () => {
    if (!token) return;
    const name = editName.trim();
    if (name.length < 2) {
      setSaveError("Ism kamida 2 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (!editBirthDate) {
      setSaveError("Tug'ilgan sanani kiriting");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateProfile(token, { name, birthDate: editBirthDate });
      setUser(updated);
      setEditing(false);
    } catch (err: any) {
      setSaveError(err.message || "Saqlanmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    try {
      const updated = await updateAvatar(token, file);
      setUser(updated);
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenGenres = async () => {
    setEditingGenres(true);
    if (allGenres.length === 0) {
      try {
        const data = await getGenres();
        setAllGenres(data.genres);
      } catch {
        // ignore
      }
    }
  };

  const toggleGenre = (slug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  };

  const handleSaveGenres = async () => {
    if (!token || !userId) return;
    setSavingGenres(true);
    try {
      await updateGenres(token, selectedGenres);
      setSavedGenres(selectedGenres);
      try {
        localStorage.setItem(
          `${GENRES_STORAGE_KEY_PREFIX}${userId}`,
          JSON.stringify(selectedGenres)
        );
      } catch {
        // ignore storage errors
      }
      setEditingGenres(false);
    } catch {
      // ignore
    } finally {
      setSavingGenres(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-main text-white">
        <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
          <div className="absolute inset-0 skeleton opacity-40" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-main to-transparent" />
        </div>
        <div className="container max-w-5xl mx-auto px-4 -mt-20 sm:-mt-28 relative z-10 pb-14">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full skeleton border-4 border-main mb-4" />
            <div className="h-8 sm:h-10 w-48 rounded-lg skeleton mb-2" />
            <div className="h-4 w-32 rounded skeleton mb-4" />
            <div className="flex gap-2">
              <div className="h-7 w-24 rounded-full skeleton" />
              <div className="h-7 w-20 rounded-full skeleton" />
            </div>
          </div>

          <div className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 rounded skeleton" />
              <div className="h-7 w-24 rounded-lg skeleton" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="h-7 w-16 rounded-lg skeleton" />
              <div className="h-7 w-20 rounded-lg skeleton" />
              <div className="h-7 w-14 rounded-lg skeleton" />
            </div>
          </div>

          <div className="space-y-8 sm:space-y-10">
            {Array.from({ length: 3 }).map((_, si) => (
              <div key={si}>
                <div className="h-5 w-28 rounded skeleton mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 sm:h-[72px] rounded-xl skeleton" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const menuSections: {
    title: string;
    items: { icon: any; label: string; href: string; badge?: number; description?: string }[];
  }[] = [
    {
      title: "Kutubxona",
      items: [
        { icon: FaBookmark, label: "Saqlangan", href: "/saqlangan", description: "Saqlagan dramalaringiz" },
        { icon: FaHistory, label: "Ko'rish tarixi", href: "/tarix", description: "Ko'rilgan kontentlar" },
        { icon: FaHeart, label: "Sevimli aktyorlar", href: "/sevimli-aktyorlar", description: "Kuzatayotgan aktyorlaringiz" },
      ],
    },
    {
      title: "Kashf etish",
      items: [
        { icon: FaStar, label: "Tavsiyalar", href: "/tavsiyalar", description: "Siz uchun tanlangan" },
        { icon: FaCalendarAlt, label: "Jadval", href: "/jadval", description: "Kutilayotgan premyeralar" },
      ],
    },
    {
      title: "Hisob",
      items: [
        {
          icon: FaCrown,
          label: subscription ? subscription.plan?.title || "Premium" : "Obuna bo'lish",
          href: "/obuna",
          description: subscription ? "Obunangiz faol" : "Premium imkoniyatlar",
        },
        {
          icon: FaBell,
          label: "Bildirishnomalar",
          href: "/bildirishnomalar",
          description: "Yangiliklar va xabarlar",
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-main text-white">
      {/* Hero backdrop */}
      <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-main to-main" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(126,84,230,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-main to-transparent" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 -mt-20 sm:-mt-28 relative z-10 pb-14">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
          {/* Avatar */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-4">
            <div className="absolute inset-0 rounded-full bg-second/20 blur-xl" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-main ring-1 ring-white/10">
              {user.avatarUrl ? (
                <Image
                  // Re-mount when the URL changes so the browser never keeps
                  // a stale pending request from a previous login session.
                  key={user.avatarUrl}
                  src={normalizeImageUrl(user.avatarUrl)}
                  alt="Avatar"
                  fill
                  sizes="128px"
                  quality={80}
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/[0.04] flex items-center justify-center">
                  <FaUser className="text-white/40 text-4xl" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Avatar yangilash"
              className="absolute -bottom-1 -right-1 w-9 h-9 bg-second rounded-full flex items-center justify-center border-[3px] border-main hover:bg-second/85 transition-all duration-300 active:scale-95 shadow-[0_6px_20px_rgba(126,84,230,0.3)]"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaCamera className="text-xs text-white" />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* Name & Info */}
          {editing ? (
            <div className="w-full max-w-sm space-y-2.5">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ismingiz"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-center outline-none focus:border-second/50 focus:bg-white/[0.05] transition-all duration-300"
              />
              <input
                type="date"
                value={editBirthDate}
                onChange={(e) => setEditBirthDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-center outline-none focus:border-second/50 focus:bg-white/[0.05] transition-all duration-300 text-white"
              />
              {saveError && <p className="text-xs text-red-400/90">{saveError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 py-3 bg-second rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-second/85 transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                  <FaCheck className="text-xs" /> {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  onClick={() => { setEditing(false); resetEditFields(); }}
                  className="py-3 px-5 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-semibold flex items-center justify-center hover:bg-white/[0.06] transition-all duration-300 active:scale-95"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                  {user.name || "Foydalanuvchi"}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  aria-label="Profilni tahrirlash"
                  className="ml-1 w-7 h-7 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 hover:text-second hover:border-second/30 transition-all duration-300"
                >
                  <FaPen className="text-[10px]" />
                </button>
              </div>
              <p className="text-sm text-gray-400 font-medium">{user.phone}</p>
              {user.birthDate && (
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {formatDateLong(user.birthDate)}
                </p>
              )}

              {/* Badges row */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                {subscription && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-second/10 border border-second/25 text-second rounded-full text-xs font-semibold">
                    <FaCrown className="text-[10px]" /> {subscription.plan?.title}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Coin balance + Top-up card */}
        <div className="relative overflow-hidden rounded-2xl border border-second/25 bg-gradient-to-br from-second/[0.12] via-second/[0.05] to-transparent p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-second/20 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-second/15 border border-second/25 flex items-center justify-center shrink-0">
                <FaCoins className="text-second text-xl sm:text-2xl" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-second font-semibold uppercase tracking-widest mb-0.5">
                  Coin balansi
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                    {(user.coin ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 font-semibold">coin</span>
                </div>
              </div>
            </div>
            <Link
              href="/coin"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-second text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-second/85 transition-all duration-300 active:scale-95 shadow-[0_8px_30px_rgba(126,84,230,0.3)]"
            >
              <FaPlus className="text-[11px]" />
              Coin qo&apos;shish
            </Link>
          </div>
        </div>

        {/* Genre Preferences Card */}
        <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5 p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-second rounded-full" />
              <h3 className="text-sm sm:text-base font-bold text-white">Sevimli janrlar</h3>
            </div>
            <button
              onClick={editingGenres ? handleSaveGenres : handleOpenGenres}
              disabled={savingGenres}
              className="text-xs font-semibold px-3 py-1.5 bg-second/10 border border-second/20 text-second rounded-lg hover:bg-second/15 transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {editingGenres ? (savingGenres ? "Saqlanmoqda..." : "Saqlash") : "O'zgartirish"}
            </button>
          </div>
          {editingGenres ? (
            <div className="flex flex-wrap gap-2">
              {allGenres.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => toggleGenre(g.slug)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-300 active:scale-95 ${
                    selectedGenres.includes(g.slug)
                      ? "bg-second text-white shadow-[0_4px_15px_rgba(126,84,230,0.25)]"
                      : "bg-white/[0.04] border border-white/10 text-gray-400 hover:bg-white/[0.08] hover:text-white hover:border-white/20"
                  }`}
                >
                  {g.title}
                </button>
              ))}
              <button
                onClick={() => { setEditingGenres(false); setSelectedGenres(savedGenres); }}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/10 text-gray-400 hover:text-white transition-all duration-300"
              >
                Bekor
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {savedGenres.length > 0 ? (
                savedGenres.map((slug) => {
                  const genre = allGenres.find((g) => g.slug === slug);
                  return (
                    <span key={slug} className="px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-xs text-white/70 font-medium">
                      {genre?.title || slug}
                    </span>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Hali janr tanlanmagan — tavsiyalarni yaxshilash uchun qo&apos;shing
                </p>
              )}
            </div>
          )}
        </div>

        {/* Menu Sections */}
        <div className="space-y-8 sm:space-y-10">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                <div className="w-1 h-5 bg-second rounded-full" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {section.title}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {section.items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="group relative flex items-center gap-4 px-4 py-3.5 sm:py-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-second/25 hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/[0.04] border border-white/5 group-hover:bg-second/10 group-hover:border-second/25 flex items-center justify-center shrink-0 transition-all duration-300">
                      <item.icon className="text-sm sm:text-base text-white/70 group-hover:text-second transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors duration-300 truncate">
                        {item.label}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="min-w-[22px] px-1.5 h-[22px] bg-second rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      <FaChevronRight className="text-[10px] text-white/30 group-hover:text-second group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-10 flex items-center justify-center gap-2.5 py-4 bg-white/[0.02] border border-white/10 rounded-xl text-gray-400 font-semibold text-sm hover:bg-white/[0.04] hover:text-white hover:border-white/15 transition-all duration-300 active:scale-[0.98]"
        >
          <FaSignOutAlt className="text-xs" />
          Hisobdan chiqish
        </button>
      </div>
    </div>
  );
}
