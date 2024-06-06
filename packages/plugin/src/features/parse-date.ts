export function parseDate(timestamp: number) {
  const d = new Date().getTime() - timestamp;

  if (d < 1000 * 60) {
    return 'Just now';
  } else if (d < 1000 * 60 * 60) {
    return `${Math.floor(d / (1000 * 60))} minutes ago`;
  } else if (d < 1000 * 60 * 60 * 24) {
    return `${Math.floor(d / (1000 * 60 * 60))} hours ago`;
  }

  return new Date(timestamp).toLocaleDateString();
}
