"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  getSubscription, getGenres, updateProfile, updateAvatar, updateGenres, getUnreadCount,
  type SubscriptionInfo, type Genre,
} from "@/lib/api";
import {
  FaUser, FaCrown, FaBookmark, FaHistory, FaBell, FaSignOutAlt,
  FaCalendarAlt, FaDownload, FaHeart, FaStar, FaLightbulb,
  FaPen, FaCamera, FaCheck, FaTimes, FaChevronRight,
} from "react-icons/fa";

export default function ProfilPage() {
  const router = useRouter();
  const { user, token, loading, logout, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Genre preferences
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
  }, [token]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBirthDate(user.birthDate || "");
      setSelectedGenres(user.genres || []);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!token) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateProfile(token, {
        name: editName.trim() || undefined,
        birthDate: editBirthDate || undefined,
      });
      await refreshUser();
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
      await updateAvatar(token, file);
      await refreshUser();
    } catch {
      // ignore
    } finally {
      setUploading(false);
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
    if (!token) return;
    setSavingGenres(true);
    try {
      await updateGenres(token, selectedGenres);
      await refreshUser();
      setEditingGenres(false);
    } catch {
      // ignore
    } finally {
      setSavingGenres(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-2 border-second border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const menuItems = [
    { icon: FaBookmark, label: "Saqlangan", href: "/saqlangan", color: "text-blue-400", bg: "bg-blue-400/10" },
    { icon: FaHistory, label: "Ko'rish tarixi", href: "/tarix", color: "text-green-400", bg: "bg-green-400/10" },
    { icon: FaDownload, label: "Yuklanganlar", href: "/yuklanganlar", color: "text-sky-400", bg: "bg-sky-400/10" },
    { icon: FaHeart, label: "Sevimli aktyorlar", href: "/sevimli-aktyorlar", color: "text-pink-400", bg: "bg-pink-400/10" },
    { icon: FaStar, label: "Tavsiyalar", href: "/tavsiyalar", color: "text-amber-400", bg: "bg-amber-400/10" },
    { icon: FaCrown, label: subscription?.isActive ? subscription.plan?.title || "Premium" : "Obuna bo'lish", href: "/obuna", color: "text-purple-400", bg: "bg-purple-400/10" },
    { icon: FaCalendarAlt, label: "Jadval", href: "/jadval", color: "text-cyan-400", bg: "bg-cyan-400/10" },
    {
      icon: FaBell,
      label: "Bildirishnomalar",
      href: "/bildirishnomalar",
      color: "text-red-400",
      bg: "bg-red-400/10",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { icon: FaLightbulb, label: "Maslahatlar", href: "/maslahatlar", color: "text-lime-400", bg: "bg-lime-400/10" },
  ];

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-10">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Desktop: 2 column layout */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT: Profile card */}
          <div className="lg:w-[380px] lg:shrink-0 space-y-4">
            <div className="bg-surface rounded-2xl border border-white/5 p-5 sm:p-6">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-4">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="Avatar" fill className="rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-second/20 flex items-center justify-center">
                      <FaUser className="text-second text-3xl" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-second rounded-full flex items-center justify-center border-2 border-main hover:bg-second/80 transition"
                  >
                    {uploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaCamera className="text-xs text-white" />
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                {editing ? (
                  <div className="w-full space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ismingiz"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-center outline-none focus:border-second/50 transition"
                    />
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-center outline-none focus:border-second/50 transition text-white"
                    />
                    {saveError && (
                      <p className="text-xs text-red-400">{saveError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 py-2.5 bg-second rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-second/80 transition disabled:opacity-50"
                      >
                        <FaCheck className="text-xs" /> {saving ? "Saqlanmoqda..." : "Saqlash"}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setEditName(user.name || ""); setEditBirthDate(user.birthDate || ""); setSaveError(""); }}
                        className="py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold">{user.name || "Foydalanuvchi"}</h1>
                      <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-second transition">
                        <FaPen className="text-xs" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{user.phone}</p>
                    {user.birthDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.birthDate).toLocaleDateString("uz", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                    {subscription?.isActive && (
                      <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-second/15 text-second rounded-full text-xs font-medium">
                        <FaCrown className="text-[10px]" /> {subscription.plan?.title}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Genre preferences */}
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sevimli janrlar</p>
                  <button
                    onClick={editingGenres ? handleSaveGenres : handleOpenGenres}
                    disabled={savingGenres}
                    className="text-xs text-second hover:text-second/80 transition disabled:opacity-50 font-medium"
                  >
                    {editingGenres ? (savingGenres ? "Saqlanmoqda..." : "Saqlash") : "O'zgartirish"}
                  </button>
                </div>
                {editingGenres ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allGenres.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => toggleGenre(g.slug)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          selectedGenres.includes(g.slug)
                            ? "bg-second text-white"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {g.title}
                      </button>
                    ))}
                    <button
                      onClick={() => { setEditingGenres(false); setSelectedGenres(user.genres || []); }}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white transition"
                    >
                      Bekor
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(user.genres && user.genres.length > 0) ? (
                      user.genres.map((g) => (
                        <span key={g} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-gray-300">
                          {typeof g === "string" ? g : (g as any).title || (g as any).slug}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Hali tanlanmagan</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Logout — mobile only, moves to bottom on desktop */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-medium hover:bg-red-500/20 transition lg:hidden"
            >
              <FaSignOutAlt />
              Chiqish
            </button>
          </div>

          {/* RIGHT: Menu grid */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {menuItems.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3.5 px-4 py-4 bg-surface rounded-xl border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`text-sm ${item.color}`} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {"badge" in item && item.badge && (
                      <span className="px-2 py-0.5 bg-second rounded-full text-[10px] font-bold min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                    <FaChevronRight className="text-[10px] text-gray-600 group-hover:text-gray-400 transition" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Logout — desktop only */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex w-full items-center justify-center gap-2 py-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-medium hover:bg-red-500/20 transition"
            >
              <FaSignOutAlt />
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
