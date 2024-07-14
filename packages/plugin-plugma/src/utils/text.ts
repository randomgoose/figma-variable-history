export function copyText(text: string) {
  try {
    const input = document.createElement('textarea');
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.value = text;

    // Find the modal element and append the input to it
    const modal = document.querySelector('.dialog-content');
    if (modal) {
      modal.appendChild(input);
    } else {
      document.body.appendChild(input);
    }

    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand('copy');

    // Remove the input from the modal or document body
    if (modal) {
      modal.removeChild(input);
    } else {
      document.body.removeChild(input);
    }
  } catch (e) {
    console.error(e);
  }
}
