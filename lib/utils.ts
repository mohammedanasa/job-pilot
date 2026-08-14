/** Job match threshold — a "strong match" is match_score >= this. */
export const MATCH_THRESHOLD = 70;

/**
 * "2 hours ago" / "Yesterday" / "3 days ago" style relative date, matching the
 * Find Jobs table's DATE FOUND column as built in Feature 09.
 */
export function formatRelativeDate(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = now - then;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
