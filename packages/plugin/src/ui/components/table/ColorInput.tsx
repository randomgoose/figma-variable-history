import { useRef, useState } from 'react';
import { Suggestions } from './Suggestions';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  id: string;
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus: boolean;
}

export function ColorInput({ value, onChange, id, onFocus, onBlur, autoFocus }: ColorInputProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'Escape') setShowSuggestions(false);
    if (e.key === 'Enter') {
      colorInputRef.current?.blur();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value);

    // Filter variables based on input
    if (value.startsWith('{')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        tabIndex={0}
        ref={colorInputRef}
        aria-label={id}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={(e) => {
          onBlur(e);
          setShowSuggestions(false);
        }}
        onChange={handleInputChange}
        className="w-full h-full font-medium text-[11px] bg-transparent"
        value={value}
        autoFocus={autoFocus}
      />
      <Suggestions
        onSelect={(variable) => {
          colorInputRef.current?.blur();
          onChange(`{${variable.name}}`);
          setShowSuggestions(false);
          colorInputRef.current?.focus();
          const timeout = setTimeout(() => {
            colorInputRef.current?.blur();
          }, 100);

          return () => clearTimeout(timeout);
        }}
        open={showSuggestions}
        ref={colorInputRef}
      />
    </div>
  );
}
