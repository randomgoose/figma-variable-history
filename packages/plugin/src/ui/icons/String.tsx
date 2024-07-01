// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';

export function String() {
  return (
    <svg
      class="svg"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      style={{ fill: 'var(--figma-color-text)' }}
    >
      <path
        fill-opacity=".5"
        fill-rule="evenodd"
        stroke="none"
        d="M3 3h10v3h-1V4H8.5v8H10v1H6v-1h1.5V4H4v2H3V3z"
      />
    </svg>
  );
}
