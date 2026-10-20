"use server";

import { getCities, getStates } from "@/lib/api/services/misc";
import type { NigeriaCity, NigeriaState } from "@/lib/api/types";
import { uuidSchema } from "@/lib/validation";

export async function loadStates(): Promise<NigeriaState[]> {
  return getStates().catch(() => []);
}

export async function loadCities(stateId: string): Promise<NigeriaCity[]> {
  if (!uuidSchema.safeParse(stateId).success) return [];
  return getCities(stateId).catch(() => []);
}
