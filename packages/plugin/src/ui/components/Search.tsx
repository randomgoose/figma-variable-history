import { IconSearch, IconX } from '@tabler/icons-react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}

export function Search({ value, onChange, onClear }: SearchProps) {
  return (
    <div className="relative">
      <IconSearch
        className="absolute text-[color:var(--figma-color-icon-tertiary)] top-1/2 left-3 -translate-y-1/2"
        size={13}
      />
      <input
        placeholder="Search variables"
        className="h-10 w-full flex-shrink-0 rounded-none border-b outline-none px-4 pl-8 bg-[color:var(--figma-color-bg)] border-[color:var(--figma-color-border)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {onClear && value.length > 0 && (
        <button className="absolute w-6 h-6 text-[color:var(--figma-color-icon-tertiary)] top-1/2 right-0 -translate-y-1/2">
          <IconX className="text-[color:var(--figma-color-icon-tertiary)]" size={12} />
        </button>
      )}
    </div>
  );
}
