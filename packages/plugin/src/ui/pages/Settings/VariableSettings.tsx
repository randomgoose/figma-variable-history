import * as Select from '@radix-ui/react-select';
import { IconChevronDown } from '@tabler/icons-react';
import { useContext } from 'react';
import { AppContext } from '../../../AppContext';
import { sendMessage } from '../../../utils/message';
import { useTranslation } from '../../../hooks/useTranslation';

export function VariablesSettings() {
  // const [colorFormat, setColorFormat] = useState('hex');
  const { setting } = useContext(AppContext);
  const { t } = useTranslation();

  const colorFormatOptions = [
    { value: 'HEX', label: 'HEX' },
    { value: 'RGB', label: 'RGB' },
    { value: 'HSL', label: 'HSL' },
  ];

  return (
    <div className="w-full">
      <h3 className="settingPage-title">{t('variables')}</h3>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <div className="settingItem-title">{t('color_format')}</div>
          <div className="settingItem-description text-[11px] text-neutral-500">
            {t('color_format_description')}
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
