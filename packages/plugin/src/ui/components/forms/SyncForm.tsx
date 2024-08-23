import { useState } from 'react';
import { Close } from '@radix-ui/react-dialog';
import { SyncTaskType } from '../../../types';

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

  const placeholder: Record<string, string> = {
    token: type === 'github' ? 'GitHub User Token' : 'Slack Bot Token or User Token',
    repository: 'Repository Name',
    owner: 'Repository Owner Username',
    filePath: 'CSS Variable File Path',
    address: 'Address',
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
                {key}
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
          Confirm
        </button>
      </Close>
    </div>
  );
}
