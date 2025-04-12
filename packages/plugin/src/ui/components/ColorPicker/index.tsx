import { ChevronDown, X } from 'lucide-react';
import { Select, Popover, Tabs } from 'radix-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HexAlphaColorPicker, RgbColorPicker } from 'react-colorful';
import { HexInput } from './HexInput';
import { VariablePicker } from '../VariablePicker';
import { motion, useDragControls } from 'motion/react';
import { convertFigmaRGBtoHexString, convertHexColorToFigmaRGBA } from '../../../utils/color';

const MotionPopoverContent = motion(Popover.Content);

const colorFormats = [
  { label: 'Hex', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
];

interface ColorPickerProps {
  defaultColor: RGB | RGBA;
  onChange: (color: RGB | RGBA | VariableAlias) => void;
  children: React.ReactNode;
  onFocus?: (e: React.FocusEvent<any>) => void;
  autoFocus?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ColorPicker({
  defaultColor,
  onChange,
  children,
  onFocus,
  autoFocus,
}: ColorPickerProps) {
  const [color, setColor] = useState(defaultColor);
  const [colorFormat, setColorFormat] = useState(colorFormats[0].value);
  const controls = useDragControls();
  const hexInputRef = useRef<HTMLInputElement>(null);

  const hex = useMemo(() => {
    if (typeof color === 'string') {
      return color;
    }

    return convertFigmaRGBtoHexString(color);
  }, [color]);

  useEffect(() => {
    if (hexInputRef.current) {
      hexInputRef.current.value = hex;
    }
  }, [hex]);

  const renderColorInput = () => {
    switch (colorFormat) {
      case 'hex':
        return <HexInput color={color} onChange={onChange} />;
      case 'rgb':
        return <RgbColorPicker />;
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        className="cursor-default rounded-[20%] focus:border-[var(--figma-color-border-brand-strong)]"
        onFocus={onFocus}
        autoFocus={autoFocus}
      >
        {children}
      </Popover.Trigger>
      <MotionPopoverContent
        side="bottom"
        drag={true}
        dragMomentum={false}
        className="panel"
        dragControls={controls}
        dragListener={false}
      >
        <div className="flex items-center justify-between">
          <Popover.Close asChild>
            <button className="btn-icon absolute top-2 right-2">
              <X size={16} strokeWidth={1.5} />
            </button>
          </Popover.Close>
          <Tabs.Root className="w-full" defaultValue="custom">
            <Tabs.List
              onPointerDown={(e) => controls.start(e)}
              className="tabs-list h-10 border-b border-[var(--figma-color-border)]"
            >
              <Tabs.Trigger className="tabs-trigger" value="custom">
                Custom
              </Tabs.Trigger>
              <Tabs.Trigger className="tabs-trigger" value="libraries">
                Libraries
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="custom" className="pb-2">
              <HexAlphaColorPicker
                color={hex}
                onChange={(color) => setColor(convertHexColorToFigmaRGBA(color))}
                onPointerUp={(e) => {
                  onChange(color);
                }}
              />
              <div className="flex items-center px-4 gap-2 h-8 mt-2">
                <Select.Root
                  value={colorFormat}
                  onValueChange={(value) => {
                    setColorFormat(value);
                  }}
                >
                  <Select.Trigger className="select-trigger w-14">
                    <Select.Value placeholder="Hex" />
                    <Select.Icon>
                      <ChevronDown size={12} strokeWidth={1} />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="dropdown-content w-24 z-[60]">
                      <Select.Viewport>
                        {colorFormats.map((format) => (
                          <Select.Item
                            key={format.value}
                            value={format.value}
                            className="dropdown-item"
                          >
                            <Select.ItemText>{format.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {renderColorInput()}
              </div>
            </Tabs.Content>
            <Tabs.Content value="libraries">
              <VariablePicker
                type="COLOR"
                onSelect={(v) => {
                  onChange({ type: 'VARIABLE_ALIAS', id: v.id });
                }}
              />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </MotionPopoverContent>
    </Popover.Root>
  );
}
