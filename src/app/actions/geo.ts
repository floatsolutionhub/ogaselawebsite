"use server";

import { z } from "zod";

import { fail, ok, type ActionResult } from "@/lib/actions";
import { getCities, getNearestCity, getStates } from "@/lib/api/services/misc";
import type { NearestCity, NigeriaCity, NigeriaState } from "@/lib/api/types";
import { uuidSchema } from "@/lib/validation";

export async function loadStates(): Promise<NigeriaState[]> {
  return getStates().catch(() => []);
}

export async function loadCities(stateId: string): Promise<NigeriaCity[]> {
  if (!uuidSchema.safeParse(stateId).success) return [];
  return getCities(stateId).catch(() => []);
}

const positionSchema = z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) });

/** The city nearest a browser's position - for "Use my current location". */
export async function locateCity(latitude: number, longitude: number): Promise<ActionResult<NearestCity>> {
  const position = positionSchema.safeParse({ latitude, longitude });
  if (!position.success) return fail("We couldn't read your location.");
  try {
    return ok(await getNearestCity(position.data.latitude, position.data.longitude));
  } catch (error) {
    return fail(error, "We couldn't find your city. Choose your state and city instead.");
  }
}
