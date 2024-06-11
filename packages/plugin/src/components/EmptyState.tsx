// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';

export function EmptyState() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ color: 'var(--figma-color-text-secondary)' }}>
        Changes to Figma variables will be displayed here
      </div>
    </div>
  );
}
