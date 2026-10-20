"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { Message } from "@/lib/api/types";
import { useViewer } from "./SessionProvider";

type Counts = { messages: number; notifications: number };
type Listener = (message: Message) => void;

type LiveValue = Counts & {
  /** Runs for every new message sent to the viewer while the page is open. */
  onMessage: (listener: Listener) => () => void;
  /** After something read messages or notifications here - re-asks for the counts. */
  setCounts: (next: Partial<Counts>) => void;
};

const LiveContext = createContext<LiveValue>({
  messages: 0,
  notifications: 0,
  onMessage: () => () => {},
  setCounts: () => {},
});

/**
 * One live connection per tab (src/app/api/live/route.ts) for the Messages and bell badges and
 * open chats. The browser's EventSource reconnects by itself whenever the stream ends.
 */
export function LiveProvider({ children }: { children: React.ReactNode }) {
  const viewer = useViewer();
  const [counts, setCountsState] = useState<Counts>({ messages: 0, notifications: 0 });
  const listeners = useRef(new Set<Listener>());

  useEffect(() => {
    if (!viewer) return;
    const source = new EventSource("/api/live");
    source.addEventListener("counts", (event) => {
      try {
        const data = JSON.parse((event as MessageEvent<string>).data) as Partial<Record<keyof Counts, number | null>>;
        setCountsState((prev) => ({
          messages: typeof data.messages === "number" ? data.messages : prev.messages,
          notifications: typeof data.notifications === "number" ? data.notifications : prev.notifications,
        }));
      } catch {
        // Ignore a malformed event.
      }
    });
    source.addEventListener("message", (event) => {
      try {
        const message = JSON.parse((event as MessageEvent<string>).data) as Message;
        listeners.current.forEach((listener) => listener(message));
      } catch {
        // Ignore a malformed event.
      }
    });
    return () => source.close();
  }, [viewer]);

  const onMessage = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const setCounts = useCallback((next: Partial<Counts>) => setCountsState((prev) => ({ ...prev, ...next })), []);

  const value = useMemo<LiveValue>(
    () => ({
      messages: viewer ? counts.messages : 0,
      notifications: viewer ? counts.notifications : 0,
      onMessage,
      setCounts,
    }),
    [viewer, counts, onMessage, setCounts],
  );

  return <LiveContext value={value}>{children}</LiveContext>;
}

export function useLive(): LiveValue {
  return useContext(LiveContext);
}
