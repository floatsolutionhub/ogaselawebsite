import "server-only";

import { api } from "../client";
import type { Announcement, NigeriaCity, NigeriaState } from "../types";

// GeoController.cs and AnnouncementsController.cs - public reference data.

export const getStates = () => api.get<NigeriaState[]>("/geo/states", false);
export const getCities = (stateId: string) => api.get<NigeriaCity[]>(`/geo/states/${stateId}/cities`, false);
export const getActiveAnnouncements = () => api.get<Announcement[]>("/announcements/active", false);
