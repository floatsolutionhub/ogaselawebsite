import "server-only";

import { api } from "../client";
import type { Announcement, NearestCity, NigeriaCity, NigeriaState, Testimonial } from "../types";

// GeoController.cs, AnnouncementsController.cs and TestimonialsController.cs - public reference data.

export const getStates = () => api.get<NigeriaState[]>("/geo/states", false);
export const getCities = (stateId: string) => api.get<NigeriaCity[]>(`/geo/states/${stateId}/cities`, false);
/** 404 Geo.NoCityNearby when no city is within reach. */
export const getNearestCity = (latitude: number, longitude: number) =>
  api.get<NearestCity>(`/geo/cities/nearest?latitude=${latitude}&longitude=${longitude}`, false);
export const getActiveAnnouncements = () => api.get<Announcement[]>("/announcements/active", false);
export const getTestimonials = () => api.get<Testimonial[]>("/testimonials", false);
