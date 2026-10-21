/**
 * Formats last seen timestamp into human-readable Indonesian time
 * e.g. "Terakhir dilihat hari ini pukul 13.15" or "Terakhir dilihat kemarin pukul 22.40"
 */
export function formatLastSeen(timestamp: number): string {
  if (!timestamp) return 'Terakhir dilihat beberapa saat lalu';

  const date = new Date(timestamp);
  const now = new Date();

  // Format time as HH.mm
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}.${minutes}`;

  // Check if today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Terakhir dilihat hari ini pukul ${timeStr}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Terakhir dilihat kemarin pukul ${timeStr}`;
  }

  // Older than yesterday
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `Terakhir dilihat ${day}/${month}/${year} pukul ${timeStr}`;
}
