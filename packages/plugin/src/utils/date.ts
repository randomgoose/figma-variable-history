export function parseDate(timestamp: number) {
  const d = Date.now() - timestamp;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (d < minute) {
    return 'Just now';
  } else if (d < hour) {
    return `${Math.floor(d / minute)} minutes ago`;
  } else if (d < day) {
    return `${Math.floor(d / hour)} hours ago`;
  }

  return new Date(timestamp).toLocaleDateString();
}
