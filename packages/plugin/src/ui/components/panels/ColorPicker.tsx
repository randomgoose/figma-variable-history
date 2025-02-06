import * as Popover from '@radix-ui/react-popover';
import { HexColorPicker } from 'react-colorful';
import * as Tabs from '@radix-ui/react-tabs';
import { X } from 'lucide-react';

export function ColorPicker({ children }: { children: React.ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="panel">
        <div className="flex items-center justify-between">
          <Popover.Close asChild>
            <button className="btn-icon absolute top-2 right-2">
              <X size={16} strokeWidth={1.5} />
            </button>
          </Popover.Close>
          <Tabs.Root defaultValue="custom">
            <Tabs.List className="tabs-list h-10">
              <Tabs.Trigger className="tabs-trigger" value="custom">
                Custom
              </Tabs.Trigger>
              <Tabs.Trigger className="tabs-trigger" value="libraries">
                Libraries
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="custom">
              <HexColorPicker />
            </Tabs.Content>
            <Tabs.Content value="libraries">
              <div>
                <input />
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
