"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getSaved, addSaved as apiAddSaved, removeSaved as apiRemoveSaved } from "./api";
import { useAuth } from "./auth";

type SavedState = {
  ids: Set<string>;
  ready: boolean;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string, source?: string) => Promise<boolean>;
  markSaved: (id: string) => void;
  markUnsaved: (id: string) => void;
};

const SavedContext = createContext<SavedState | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setIds(new Set());
      setReady(false);
      return;
    }
    let cancelled = false;
    getSaved(token)
      .then((data) => {
        if (cancelled) return;
        setIds(new Set(data.items.map((item) => item.dramaId)));
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isSaved = useCallback((id: string) => ids.has(id), [ids]);

  const markSaved = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const markUnsaved = useCallback((id: string) => {
    setIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleSaved = useCallback(
    async (id: string, source?: string) => {
      if (!token) return false;
      const currentlySaved = ids.has(id);
      if (currentlySaved) {
        markUnsaved(id);
        try {
          await apiRemoveSaved(token, id);
          return false;
        } catch {
          markSaved(id);
          return true;
        }
      } else {
        markSaved(id);
        try {
          await apiAddSaved(token, id, source);
          return true;
        } catch {
          markUnsaved(id);
          return false;
        }
      }
    },
    [token, ids, markSaved, markUnsaved]
  );

  return (
    <SavedContext.Provider value={{ ids, ready, isSaved, toggleSaved, markSaved, markUnsaved }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
