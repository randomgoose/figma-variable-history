export function copyText(text: string) {
  try {
    navigator.clipboard.writeText(text).catch(() => {});
  } catch (e) {}
}
