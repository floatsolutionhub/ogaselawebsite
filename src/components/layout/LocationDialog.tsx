"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Globe, LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";

import { loadCities, loadStates } from "@/app/actions/geo";
import { useShopLocation } from "@/components/providers/LocationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { inputClass } from "@/components/ui/styles";
import type { NigeriaCity, NigeriaState } from "@/lib/api/types";

/** The app's location picker: all of Nigeria, or a state and then a city. */
export function LocationDialog({ open, onClose, intro }: { open: boolean; onClose: () => void; intro?: boolean }) {
  const location = useShopLocation();
  const toast = useToast();
  const [states, setStates] = useState<NigeriaState[] | null>(null);
  const [state, setState] = useState<NigeriaState | null>(null);
  const [cities, setCities] = useState<NigeriaCity[] | null>(null);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open && states === null) loadStates().then(setStates);
  }, [open, states]);

  useEffect(() => {
    if (!state) return;
    let active = true;
    loadCities(state.id).then((list) => active && setCities(list));
    return () => {
      active = false;
    };
  }, [state]);

  const close = () => {
    setState(null);
    setCities(null);
    setQuery("");
    onClose();
  };

  const q = query.trim().toLowerCase();
  const stateResults = useMemo(() => (states ?? []).filter((s) => s.name.toLowerCase().includes(q)), [states, q]);
  const cityResults = useMemo(() => (cities ?? []).filter((c) => c.name.toLowerCase().includes(q)), [cities, q]);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Your browser can't share its location", "Choose your area below instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        location.setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        toast.success("Location set", "We'll show distances and the nearest offices. Now pick your area.");
      },
      () => {
        setLocating(false);
        toast.info("Location access not granted", "You can set your area manually instead.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
  };

  const row =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] transition hover:bg-brand-50 aria-[current=true]:text-brand-700";

  return (
    <Dialog
      open={open}
      onClose={close}
      title={state ? `Choose a city in ${state.name}` : intro ? "Find things near you" : "Choose a state"}
      description={
        intro && !state
          ? "Ogasela uses your area to show listings and sellers close to you. You can change it any time."
          : undefined
      }
    >
      <div className="space-y-3">
        {state ? (
          <button type="button" onClick={() => (setState(null), setCities(null), setQuery(""))} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
            <ChevronLeft aria-hidden className="size-4" /> All states
          </button>
        ) : (
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="flex w-full items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-left text-sm font-semibold text-brand-800 ring-1 ring-brand-100 hover:bg-brand-100"
          >
            {locating ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <LocateFixed aria-hidden className="size-5" />}
            {location.coords ? "Update my location" : "Use my current location"}
            {location.coords && <Check aria-hidden className="ml-auto size-4" />}
          </button>
        )}

        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={state ? "Search city" : "Search state"}
            aria-label={state ? "Search city" : "Search state"}
            className={`${inputClass} pl-10`}
          />
        </div>

        <ul className="max-h-[50dvh] overflow-y-auto">
          {!state && (!q || "all states in nigeria".includes(q)) && (
            <li>
              <button
                type="button"
                aria-current={location.isNationwide}
                onClick={() => {
                  location.setLocation({ city: "", state: "" });
                  close();
                }}
                className={row}
              >
                <Globe aria-hidden className="size-5 text-brand-600" />
                <span className="flex-1">
                  <span className="block font-semibold">All States In Nigeria</span>
                  <span className="text-xs text-ink-500">See ads from across the country</span>
                </span>
                {location.isNationwide && <Check aria-hidden className="size-4" />}
              </button>
            </li>
          )}
          {(state ? cities : states) === null ? (
            <li className="flex justify-center py-8">
              <LoaderCircle aria-hidden className="size-6 animate-spin text-brand-600" />
            </li>
          ) : state ? (
            cityResults.map((city) => {
              const active = city.name === location.city && state.name === location.state;
              return (
                <li key={city.id}>
                  <button
                    type="button"
                    aria-current={active}
                    onClick={() => {
                      location.setLocation({ city: city.name, state: state.name });
                      close();
                    }}
                    className={row}
                  >
                    <MapPin aria-hidden className="size-4 text-ink-300" />
                    <span className="flex-1">{city.name}</span>
                    {active && <Check aria-hidden className="size-4" />}
                  </button>
                </li>
              );
            })
          ) : (
            stateResults.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  aria-current={entry.name === location.state}
                  onClick={() => (setState(entry), setQuery(""))}
                  className={row}
                >
                  <MapPin aria-hidden className="size-4 text-ink-300" />
                  <span className="flex-1">{entry.name}</span>
                </button>
              </li>
            ))
          )}
          {(state ? cities && cityResults.length === 0 : states && stateResults.length === 0 && q && !"all states in nigeria".includes(q)) && (
            <li className="py-6 text-center text-sm text-ink-500">Nothing matches “{query}”</li>
          )}
        </ul>
      </div>
    </Dialog>
  );
}
