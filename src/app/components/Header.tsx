"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaSearch, FaTimes, FaUser, FaBell } from "react-icons/fa";
import { SlidersHorizontal, Menu, X } from "lucide-react";
import Image from "next/image";
import FilterModal from "./FilterModal";
import { useAuth } from "@/lib/auth";
import { getUnreadCount } from "@/lib/api";

const navs = [
  { name: "Asosiy", href: "/" },
  { name: "Dramalar", href: "/hammasi" },
  { name: "Filmlar", href: "/filmlar" },
  { name: "Mashxur", href: "/mashxur" },
  { name: "Janrlar", href: "/janrlar" },
  { name: "Aktyorlar", href: "/aktyorlar" },
  { name: "Jadval", href: "/jadval" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setOpenSearch(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (openSearch) searchInputRef.current?.focus();
  }, [openSearch]);

  // Fetch unread notification count
  useEffect(() => {
    if (!token) { setUnreadCount(0); return; }
    getUnreadCount(token).then((data) => setUnreadCount(data.count)).catch(() => {});
    // Poll every 60 seconds
    const interval = setInterval(() => {
      getUnreadCount(token).then((data) => setUnreadCount(data.count)).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Netflix-style: tashqariga bosganda search yopiladi
  useEffect(() => {
    if (!openSearch) return;
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setOpenSearch(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openSearch]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpenSearch(false);
      setQuery("");
    }
  };

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
              <img src="/assets/logo.png" className="w-28 sm:w-32 md:w-40" alt="IDUB" />
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Netflix-style inline expanding search */}
            <div ref={searchBoxRef} className="relative flex items-center">
              <div
                className={`flex items-center transition-all duration-300 ease-in-out rounded overflow-hidden ${
                  openSearch
                    ? "w-[160px] sm:w-[220px] md:w-[280px] bg-black/90 border border-white/60"
                    : "w-9 bg-transparent border border-transparent"
                }`}
                style={{ height: 36 }}
              >
                <button
                  onClick={() => {
                    if (openSearch && query.trim()) {
                      handleSearch();
                    } else {
                      setOpenSearch((p) => !p);
                      if (openSearch) setQuery("");
                    }
                  }}
                  className="shrink-0 w-9 h-9 flex items-center justify-center text-white hover:text-second transition-colors"
                  aria-label="Qidirish"
                >
                  <FaSearch size={15} />
                </button>
                <input
                  ref={searchInputRef}
                  className={`bg-transparent text-white text-sm placeholder:text-gray-500 outline-none h-full transition-all duration-300 ${
                    openSearch ? "w-full pr-2 opacity-100" : "w-0 opacity-0"
                  }`}
                  placeholder="Film, serial, aktyor..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                    if (e.key === "Escape") {
                      setOpenSearch(false);
                      setQuery("");
                    }
                  }}
                />
               
              </div>
            </div>

           

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
                <Image src={user.avatarUrl} alt="" width={36} height={36} className="w-full h-full object-cover" />
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

        {/* Mobile menu (smooth height transition) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
            mobileMenu ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-main/98 backdrop-blur-xl border-t border-white/5">
            <nav className="container flex flex-col py-3 gap-0.5">
              {navs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl transition-all duration-300 ${
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
      </header>

    </>
  );
}
