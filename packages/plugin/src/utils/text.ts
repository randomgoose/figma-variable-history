export function copyText(text: string) {
  try {
    const input = document.createElement('textarea');
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.value = text;
    document.body.appendChild(input);
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(input);
  } catch (e) {
    console.error(e);
  }
}
