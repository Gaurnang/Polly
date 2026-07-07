export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export const POLL_TYPE_META = {
  single:        { label: "Single Choice", color: "badge-single",  icon: "◉" },
  single_choice: { label: "Single Choice", color: "badge-single",  icon: "◉" }, // DB legacy alias
  rating:        { label: "Rating",        color: "badge-rating",  icon: "★" },
  text:          { label: "Open Text",     color: "badge-text",    icon: "✏" },
  boolean:       { label: "Yes / No",      color: "badge-boolean", icon: "?" },
};
