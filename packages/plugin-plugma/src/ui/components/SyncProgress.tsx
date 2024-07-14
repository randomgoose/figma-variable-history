import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useCallback } from 'react';
import { GitHubLogo } from '../icons/GitHubLogo';

interface SyncProgressProps {
  activeKey: string;
  items: { key: string; label: string }[];
}

export function SyncProgress(props: SyncProgressProps) {
  const { items } = props;

  const activeKeyIndex = items.findIndex(({ key }) => key === props.activeKey);

  const renderStatusIcon = useCallback((status: 'active' | 'pending' | 'done') => {
    return (
      <div className="w-4 h-4 flex items-center justify-center">
        {status === 'done' ? (
          <div
            style={{
              background: 'var(--figma-color-bg-success-tertiary)',
              color: 'var(--figma-color-icon-success)',
            }}
            className={clsx(
              'w-[14px] h-[14px] relative flex items-center justify-center rounded-full',
              "before:content-[''] before:inline-block before:w-px before:h-3 before:absolute before:left-1/2 before:-translate-x-1/2 before:top-3 before:bg-[var(--figma-color-bg-success-tertiary)]"
            )}
          >
            <Check strokeWidth={4} size={8} />
          </div>
        ) : (
          <div
            style={{
              background:
                status === 'active'
                  ? 'var(--figma-color-bg-inverse)'
                  : 'var(--figma-color-icon-tertiary)',
            }}
            className={clsx(
              'w-1 h-1 rounded-full relative',
              "before:content-[''] before:inline-block before:w-px before:h-3 before:bg-[var(--figma-color-bg-secondary)] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-2",
              status === 'active'
                ? 'before:bg-[var(--figma-color-border-strong)]'
                : 'before:bg-[var(--figma-color-border)]'
            )}
          />
        )}
      </div>
    );
  }, []);

  return (
    <div className="p-3" style={{ background: 'var(--figma-color-bg-secondary)' }}>
      <h3 className="font-semibold flex items-center gap-2">
        <GitHubLogo size={16} />
        Progress
      </h3>
      <ul className="mt-2">
        {items.map(({ label, key }, index) => {
          const status =
            index === activeKeyIndex ? 'active' : index < activeKeyIndex ? 'done' : 'pending';

          return (
            <li
              className="font-normal h-6 flex items-center gap-2 [&:last-of-type_*]:before:hidden"
              style={{
                color:
                  status === 'pending'
                    ? 'var(--figma-color-text-secondary)'
                    : 'var(--figma-color-text)',
              }}
              key={key}
            >
              {renderStatusIcon(status)}
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
