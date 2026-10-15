import type { LucideIcon } from "lucide-react";

export type FutureFeature = { slug: string; label: string; icon: LucideIcon; summary: string; actions: string[] };

/** Upcoming modules shown in the sidebar. */
export const futureFeatures: FutureFeature[] = [];
