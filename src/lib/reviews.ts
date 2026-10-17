export interface PublicReview { id: string; created_at: string; name: string; rating: number; comment: string; verified: boolean; starred: boolean; reply: string; service: string }

/** Starting rating carried over from earlier customer feedback, blended with new reviews. */
export const BASE_RATING = { average: 4.5, count: 20 };

export function ratingSummary(ratings: number[], base = BASE_RATING) {
  const count = base.count + ratings.length;
  const total = base.average * base.count + ratings.reduce((s, r) => s + r, 0);
  return { average: count ? Math.round((total / count) * 10) / 10 : 0, count };
}
