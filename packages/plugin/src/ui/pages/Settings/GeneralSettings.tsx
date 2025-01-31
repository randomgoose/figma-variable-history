import * as Select from '@radix-ui/react-select';
import { sendMessage } from '../../../utils/message';
import { useContext } from 'react';
import { AppContext } from '../../../AppContext';
import { IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';

const languageOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
];

export function GeneralSettings() {
  const { setting } = useContext(AppContext);
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="settingPage-title">{t('general')}</h3>

      <div className="mt-6 flex items-start justify-between">
        <div className="settingItem-title">{t('language')}</div>
        <Select.Root
          value={setting?.language || 'en-US'}
          onValueChange={(value) => {
            sendMessage('SET_PLUGIN_SETTING', { language: value });
          }}
        >
          <Select.Trigger className="w-fit flex items-center justify-between cursor-default">
            <Select.Value placeholder="Language" />
            <Select.Icon>
              <IconChevronDown size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="dropdown-content overflow-hidden">
              <Select.Viewport>
                {languageOptions.map((option) => (
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
