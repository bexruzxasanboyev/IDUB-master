"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaBell } from "react-icons/fa";
import { Search, Menu, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { getUnreadCount, normalizeImageUrl } from "@/lib/api";
import HeaderSearchDropdown from "./HeaderSearchDropdown";

const navs = [
  { name: "Asosiy", href: "/" },
  { name: "Dramalar", href: "/hammasi" },
  { name: "Filmlar", href: "/filmlar" },
  { name: "Mashxur", href: "/mashxur" },
  { name: "Janrlar", href: "/janrlar" },
  { name: "Aktyorlar", href: "/aktyorlar" },
  { name: "Ilova", href: "/ilova" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, token } = useAuth();

  const [openSearch, setOpenSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Passive listener — never blocks scroll, and rAF-throttled to avoid
    // re-rendering Header on every pixel.
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setOpenSearch(false);
  }, [pathname]);

  // Keyboard shortcut "/" to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !openSearch) {
        const target = e.target as HTMLElement;
        const tag = target?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
          return;
        }
        e.preventDefault();
        setOpenSearch(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [openSearch]);

  // Fetch unread notification count — deferred so it never competes with
  // critical above-the-fold rendering; paused while the tab is hidden.
  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const fetchCount = () => {
      if (cancelled || document.visibilityState === "hidden") return;
      getUnreadCount(token)
        .then((data) => {
          if (!cancelled) setUnreadCount(data.count);
        })
        .catch(() => {});
    };

    const start = () => {
      fetchCount();
      interval = setInterval(fetchCount, 120000); // 2 min (was 1 min)
    };

    // Defer first fetch until the browser is idle.
    const schedule = (cb: () => void) => {
      const ric = (window as any).requestIdleCallback as
        | ((cb: () => void, opts?: { timeout: number }) => number)
        | undefined;
      if (ric) ric(cb, { timeout: 2000 });
      else setTimeout(cb, 800);
    };
    schedule(start);

    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchCount();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [token]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
          scrolled
            ? "bg-main/95 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.4)]"
            : "bg-gradient-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="container flex items-center justify-between py-4 md:py-5">
          {/* LEFT: Logo + Nav */}
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href="/" className="shrink-0">
              <Image
                src="/assets/logo.png"
                width={160}
                height={48}
                priority
                fetchPriority="high"
                className="w-28 sm:w-32 md:w-40 h-auto"
                alt="IDUB"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-1 lg:gap-1 text-sm lg:text-base">
              {navs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 ${
                    pathname === item.href
                      ? "text-white font-semibold bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-second rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search trigger — full-screen YouTube-style dropdown */}
            <button
              onClick={() => setOpenSearch(true)}
              aria-label="Qidirish"
              className="group hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-second/30 rounded-full transition-all duration-300"
            >
              <Search
                size={15}
                className="text-gray-400 group-hover:text-second transition-colors"
              />
              <span className="text-xs text-gray-500 group-hover:text-white/80 transition-colors pr-1 hidden md:inline">
                Film, serial qidirish...
              </span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-semibold text-gray-500">
                /
              </span>
            </button>
            <button
              onClick={() => setOpenSearch(true)}
              aria-label="Qidirish"
              className="sm:hidden w-9 h-9 flex items-center justify-center text-white/80 hover:text-second transition-colors"
            >
              <Search size={18} />
            </button>


            {/* Notifications */}
            {user && (
              <Link
                href="/bildirishnomalar"
                className="relative w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                aria-label="Bildirishnomalar"
              >
                <FaBell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Profile / Login */}
            <Link
              href={user ? "/profil" : "/login"}
              className="w-9 h-9 flex items-center justify-center rounded-full overflow-hidden border border-white/10 hover:border-second/50 transition-colors shrink-0"
            >
              {user?.avatarUrl ? (
                <Image
                  key={user.avatarUrl}
                  src={normalizeImageUrl(user.avatarUrl)}
                  alt=""
                  width={36}
                  height={36}
                  sizes="36px"
                  quality={70}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400 text-xs" />
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenu((p) => !p)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Menyu"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

      </header>

      {/* Mobile fullscreen drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileMenu}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenu(false)}
        />
        {/* Drawer panel */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-main border-r border-white/5 shadow-2xl transition-transform duration-300 ${
            mobileMenu ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <Link href="/" onClick={() => setMobileMenu(false)} className="shrink-0">
              <Image
                src="/assets/logo.png"
                width={140}
                height={42}
                className="w-32 h-auto"
                alt="IDUB"
              />
            </Link>
            <button
              onClick={() => setMobileMenu(false)}
              className="w-9 h-9 flex items-center justify-center text-white/80 hover:text-white"
              aria-label="Yopish"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col py-3 px-3 gap-1 overflow-y-auto max-h-[calc(100vh-72px)]">
            {navs.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenu(false)}
                className={`px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-second/15 text-second font-semibold border-l-2 border-second"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {openSearch && (
        <HeaderSearchDropdown onClose={() => setOpenSearch(false)} />
      )}
    </>
  );
}
