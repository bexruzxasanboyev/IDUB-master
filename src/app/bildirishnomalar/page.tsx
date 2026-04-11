"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNotifications, markNotificationRead, markAllNotificationsRead, type NotificationItem, type Pagination } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import Link from "next/link";

export default function BildirishnomalarPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    getNotifications(token, 1, 20)
      .then((data) => {
        setItems(data.items);
        setUnread(data.unreadCount);
        setHasMore(data.pagination.hasNext);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  const loadMore = async () => {
    if (!token || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await getNotifications(token, nextPage, 20);
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.pagination.hasNext);
      setPage(nextPage);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  const markRead = async (id: string) => {
    if (!token) return;
    try {
      await markNotificationRead(token, id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsRead(token);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  // Handle notification click - navigate if data has link
  const handleClick = (item: NotificationItem) => {
    if (!item.isRead) markRead(item.id);
    if (item.data?.dramaId) {
      router.push(`/movie/${item.data.dramaId}`);
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-second font-semibold text-2xl sm:text-3xl md:text-4xl flex items-center gap-2">
          Bildirishnomalar
          {unread > 0 && (
            <span className="px-2 py-0.5 bg-second rounded-full text-xs font-bold">{unread}</span>
          )}
        </h1>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <FaCheckDouble /> Hammasini o&apos;qish
          </button>
        )}
      </div>

      {fetching ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FaBell className="text-4xl text-gray-600 mb-3" />
          <h3 className="text-xl font-medium mb-2">Bildirishnomalar yo&apos;q</h3>
          <p className="text-gray-400 text-sm">Yangi bildirishnomalar bu yerda ko&apos;rinadi</p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl transition ${
                  item.isRead ? "bg-white/[0.02]" : "bg-second/5 border border-second/10"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.isRead ? "bg-transparent" : "bg-second"}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  {item.body && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.body}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString("uz", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {item.type && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-gray-500">{item.type}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full mt-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
            >
              {loadingMore ? "Yuklanmoqda..." : "Ko'proq ko'rsatish"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
