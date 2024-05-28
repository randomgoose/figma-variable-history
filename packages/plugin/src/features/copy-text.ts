export function copyText(text: string) {
    const input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = text;
    input.select();
    input.setSelectionRange(0, 99999);

    document.execCommand('copy');
}