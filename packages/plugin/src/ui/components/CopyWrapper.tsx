import { ReactNode } from 'react';
import { toast } from 'sonner';
import { copyText } from '../../utils/text';

export function CopyTextWrapper({
  children,
  text,
  allowCopy = true,
}: {
  children: ReactNode;
  text: string;
  allowCopy?: boolean;
}) {
  return (
    <div
      style={{ display: 'inline-block' }}
      className={
        'leading-8 max-w-full truncate px-1.5 rounded-[4px] transition-all duration-200 hover:bg-[color:var(--figma-color-bg-secondary)] cursor-pointer active:scale-95'
      }
      onClick={() => {
        if (allowCopy) {
          copyText(text);
          toast(`Copied ${text}!`, { duration: 1000 });
        }
      }}
    >
      {children}
    </div>
  );
}
