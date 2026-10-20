"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import { recordSave } from "@/app/actions/listings";

// Favourites live in this browser only, the same as on the app (device-local). Each new save is
// still reported so it counts toward the seller's analytics.

const STORAGE_KEY = "ogasela_favourites_v1";
const MAX = 40;
const EMPTY: string[] = [];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && UUID.test(id)).slice(0, MAX) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(ids: string[]) {
  cache = ids;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked (private mode) - favourites last for this visit only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

type FavouritesValue = {
  ids: string[];
  isFavourite: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (ids: string[]) => void;
};

const FavouritesContext = createContext<FavouritesValue | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((id: string) => {
    const current = read();
    if (current.includes(id)) {
      write(current.filter((x) => x !== id));
    } else {
      write([id, ...current].slice(0, MAX));
      recordSave(id).catch(() => {});
    }
  }, []);

  const remove = useCallback((gone: string[]) => {
    write(read().filter((id) => !gone.includes(id)));
  }, []);

  const value = useMemo<FavouritesValue>(
    () => ({ ids, isFavourite: (id) => ids.includes(id), toggle, remove }),
    [ids, toggle, remove],
  );

  return <FavouritesContext value={value}>{children}</FavouritesContext>;
}

export function useFavourites(): FavouritesValue {
  const value = useContext(FavouritesContext);
  if (!value) throw new Error("useFavourites must be used within FavouritesProvider");
  return value;
}
