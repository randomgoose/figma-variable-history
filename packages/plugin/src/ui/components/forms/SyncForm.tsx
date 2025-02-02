import { useState } from 'react';
import { Close } from '@radix-ui/react-dialog';
import { SyncTaskType } from '../../../types';
import { useTranslation } from '../../../hooks/useTranslation';

interface GitSttingsProps {
  defaultData?: { repository: string; owner: string; token: string; filePath: string };
  onSubmit: ({
    repository,
    owner,
    token,
    filePath,
  }: {
    repository: string;
    owner: string;
    token: string;
    filePath: string;
  }) => void;
  type: SyncTaskType;
}

const defaultDataMap = {
  github: {
    repository: '',
    owner: '',
    token: '',
    filePath: '',
  },
  slack: {
    channelId: '',
    filename: '',
    token: '',
  },
  custom: {
    address: '',
  },
};

export function SyncForm({ onSubmit, defaultData, type }: GitSttingsProps) {
  const [data, setData] = useState(defaultData || defaultDataMap[type]);
  const { t } = useTranslation();

  const placeholder: Record<string, string> = {
    token: type === 'github' ? t('github_user_token') : t('slack_bot_token_or_user_token'),
    repository: t('repository_name'),
    owner: t('repository_owner_username'),
    filePath: t('css_variable_file_path'),
    address: t('address'),
  };

  const hasEmptyValues = Object.values(data).some((value) => !value);

  return (
    <div className={'w-full flex flex-col gap-4 p-4'}>
      {Object.entries(data)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => {
          return (
            <div key={key}>
              <div
                className="capitalize mb-1"
                style={{ color: 'var(--figma-color-text-secondary)' }}
              >
                {t(key)}
              </div>
              <input
                className="input w-full"
                value={value}
                type={key === 'token' ? 'password' : 'text'}
                placeholder={placeholder[key] || key}
                onChange={(e) =>
                  setData({
                    ...data,
                    [key]: e.target.value,
                  })
                }
              />
            </div>
          );
        })}

      <Close asChild>
        <button
          disabled={hasEmptyValues}
          className="btn-primary"
          onClick={() => {
            onSubmit(data);
          }}
        >
          {t('confirm')}
        </button>
      </Close>
    </div>
  );
}
