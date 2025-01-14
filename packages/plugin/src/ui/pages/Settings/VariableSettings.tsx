import * as Select from '@radix-ui/react-select';
import { IconChevronDown } from '@tabler/icons-react';
import { useContext } from 'react';
import { AppContext } from '../../../AppContext';
import { sendMessage } from '../../../utils/message';

export function VariablesSettings() {
  // const [colorFormat, setColorFormat] = useState('hex');
  const { setting } = useContext(AppContext);

  const colorFormatOptions = [
    { value: 'HEX', label: 'HEX' },
    { value: 'RGB', label: 'RGB' },
    { value: 'HSL', label: 'HSL' },
  ];

  return (
    <div className="w-full ">
      <h3 className="font-semibold text-[13px] mt-1">Variables</h3>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <div>Color format</div>
          <div className="settingItem-description text-[11px] text-neutral-500">
            This applies to variable export and synchronization.
          </div>
        </div>

        <Select.Root
          value={setting?.colorFormat || 'RGB'}
          onValueChange={(value) => {
            sendMessage('SET_PLUGIN_SETTING', {
              colorFormat: value,
            });
          }}
        >
          <Select.Trigger className="w-fit flex items-center justify-between cursor-default">
            <Select.Value placeholder="Select a color format" />
            <Select.Icon>
              <IconChevronDown size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="dropdown-content overflow-hidden">
              <Select.Viewport>
                {colorFormatOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value} className="dropdown-item">
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}
