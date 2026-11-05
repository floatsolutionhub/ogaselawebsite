"use client";

import { useEffect, useState } from "react";

export type Loaded<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "ready"; data: T };

/**
 * Runs `load` in the browser whenever `key` changes and tracks its result. `key` stands in for a
 * dependency list: anything that should trigger a reload must be part of it.
 */
export function useApi<T>(key: string, load: () => Promise<T>): Loaded<T> {
  const [state, setState] = useState<{ key: string; value: Loaded<T> }>({ key, value: { status: "loading" } });

  useEffect(() => {
    let active = true;
    load().then(
      (data) => active && setState({ key, value: { status: "ready", data } }),
      (error: unknown) => active && setState({ key, value: { status: "error", error } }),
    );
    return () => {
      active = false;
    };
    // `key` is the dependency list (see above) - `load` is a new closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // A stale result from the previous key shows as loading, not as the old page's data.
  return state.key === key ? state.value : { status: "loading" };
}
