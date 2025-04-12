import { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ParsedValue } from '../ParsedValue';
import { AppContext } from '../../../AppContext';

interface SuggestionsProps {
  open: boolean;
  onSelect: (variable: Variable) => void;
}

export const Suggestions = forwardRef<HTMLInputElement, SuggestionsProps>(
  ({ open, onSelect }, ref) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [items, setItems] = useState<Variable[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { variables } = useContext(AppContext);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedIndex(0);
    }, [open]);

    useEffect(() => {
      const input = (ref as any)?.current;
      if (!input) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!open) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % variables.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + variables.length) % variables.length);
            break;
          case 'Enter':
            onSelect(items[selectedIndex]);
            break;
        }
      };

      input.addEventListener('keydown', handleKeyDown);
      return () => input.removeEventListener('keydown', handleKeyDown);
    }, [open, variables.length, items, selectedIndex]);

    useEffect(() => {
      if (open) {
        const rect = (ref as any)?.current?.getBoundingClientRect();
        setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      }
    }, [open]);

    useEffect(() => {
      const value = (ref as any)?.current?.value;
      const searchTerm = value.slice(1).toLowerCase();
      const filtered = variables
        .filter((v) => v.resolvedType === 'COLOR')
        .filter((v) => v.name.toLowerCase().trim().includes(searchTerm));
      setItems(filtered);
    }, [(ref as any).current?.value]);

    useEffect(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const selectedElement = container.children[selectedIndex] as HTMLElement;

        if (selectedElement) {
          selectedElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
          });
        }
      }
    }, [selectedIndex]);

    return (
      open &&
      createPortal(
        <div
          ref={containerRef}
          className="fixed p-1 w-[220px] max-h-40 overflow-y-auto bg-white border rounded-[13px] shadow-lg z-50"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {items.map((variable, index) => (
            <div
              tabIndex={0}
              key={variable.id}
              className={`px-1 py-1 flex items-center hover:bg-gray-100 cursor-pointer text-[11px] rounded-[5px] ${
                selectedIndex === index ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelect(variable)}
            >
              <ParsedValue
                variable={variable}
                modeId={Object.keys(variable.valuesByMode)[0]}
                option={{ showLabel: false, allowCopy: false }}
              />
              <span className="text-[11px] text-ellipsis max-w-full text-nowrap">
                {(() => {
                  const value = (ref as any)?.current?.value;
                  const searchTerm = value?.slice(1).toLowerCase() || '';
                  const name = variable.name;
                  const lowerName = name.toLowerCase();
                  const index = lowerName.indexOf(searchTerm);

                  if (index === -1 || !searchTerm) return name;

                  return (
                    <>
                      {name.slice(0, index)}
                      <span className="bg-yellow-200">
                        {name.slice(index, index + searchTerm.length)}
                      </span>
                      {name.slice(index + searchTerm.length)}
                    </>
                  );
                })()}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )
    );
  }
);

Suggestions.displayName = 'Suggestions';
