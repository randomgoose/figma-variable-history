const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseDate(timestamp: number, option: { relative?: boolean } = { relative: true }) {
  const d = Date.now() - timestamp;
  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const date = new Date(timestamp);

  if (option.relative) {
    if (d < minute) {
      return 'Just now';
    } else if (d < hour) {
      return `${Math.floor(d / minute)} minutes ago`;
    } else if (d < day) {
      return `${Math.floor(d / hour)} hours ago`;
    } else {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
  }

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
