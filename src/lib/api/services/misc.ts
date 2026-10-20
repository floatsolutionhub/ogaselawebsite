import "server-only";

import { api } from "../client";
import type { Announcement, NigeriaCity, NigeriaState, Testimonial } from "../types";

// GeoController.cs, AnnouncementsController.cs and TestimonialsController.cs - public reference data.

export const getStates = () => api.get<NigeriaState[]>("/geo/states", false);
export const getCities = (stateId: string) => api.get<NigeriaCity[]>(`/geo/states/${stateId}/cities`, false);
export const getActiveAnnouncements = () => api.get<Announcement[]>("/announcements/active", false);
export const getTestimonials = () => api.get<Testimonial[]>("/testimonials", false);
