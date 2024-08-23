import { useContext, useState } from 'react';
import { AppContext } from '../../../AppContext';
import { SyncForm } from '../../components/forms/SyncForm';
import * as Dialog from '@radix-ui/react-dialog';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  CustomHTTPSyncConfig,
  GitHubSyncConfig,
  SlackSyncConfig,
  SyncTaskType,
} from '../../../types';
import { IconBrandGithub, IconBrandSlack, IconPlus, IconWorld } from '@tabler/icons-react';
import { sendMessage } from '../../../utils/message';
import { SyncTaskIcon } from '../../components/SyncTaskIcon';

const syncProviderList: { label: string; value: SyncTaskType; icon: any }[] = [
  { label: 'Github', value: 'github', icon: IconBrandGithub },
  { label: 'Slack', value: 'slack', icon: IconBrandSlack },
  { label: 'Custom HTTP Request', value: 'custom', icon: IconWorld },
];

export function Synchronization() {
  const { setting } = useContext(AppContext);
  const [formType, setFormType] = useState<SyncTaskType>('github');

  const syncComponentMap = {
    github: (
      <SyncForm
        type="github"
        onSubmit={(data) => {
          sendMessage('SET_PLUGIN_SETTING', {
            syncTasks: setting?.syncTasks
              ? [...setting?.syncTasks, { config: { ...data }, enabled: true, type: 'github' }]
              : [{ config: { ...data }, enabled: true, type: 'github' }],
          });
        }}
      />
    ),
    slack: (
      <SyncForm
        type="slack"
        onSubmit={(data) => {
          sendMessage('SET_PLUGIN_SETTING', {
            syncTasks: setting?.syncTasks
              ? [...setting?.syncTasks, { config: { ...data }, enabled: true, type: 'slack' }]
              : [{ config: { ...data }, enabled: true, type: 'slack' }],
          });
        }}
      />
    ),
    custom: (
      <SyncForm
        type="custom"
        onSubmit={(data) => {
          sendMessage('SET_PLUGIN_SETTING', {
            syncTasks: setting?.syncTasks
              ? [...setting?.syncTasks, { config: { ...data }, enabled: true, type: 'custom' }]
              : [{ config: { ...data }, enabled: true, type: 'custom' }],
          });
        }}
      />
    ),
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[13px]">Synchronization</h3>
        <Dialog.Root>
          <Dropdown.Root>
            <Dropdown.Trigger className="btn-outline hover:bg-[color:var(--figma-color-bg-secondary)] h-7 border-[color:var(--figma-color-border)] shadow-sm gap-1">
              <IconPlus size={14} />
              New Sync task
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content className="dropdown-content">
                {syncProviderList.map(({ label, value, icon }) => {
                  const Icon = icon;
                  return (
                    <Dialog.Trigger key={label} asChild>
                      <Dropdown.Item
                        className="dropdown-item flex gap-1"
                        onClick={() => {
                          setFormType(value);
                        }}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                        {label}
                      </Dropdown.Item>
                    </Dialog.Trigger>
                  );
                })}
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
          <Dialog.Portal>
            <Dialog.Overlay className="dialog-overlay" />
            <Dialog.Content className="dialog-content h-fit">
              <Dialog.Title className="dialog-title capitalize">Add {formType} sync</Dialog.Title>
              {syncComponentMap[formType]}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      <div
        className="border rounded-md mt-3 w-full h-48 overflow-auto"
        style={{ borderColor: 'var(--figma-color-border)' }}
      >
        {setting?.syncTasks?.length > 0 ? (
          setting?.syncTasks?.map((data, index) => {
            <SyncTaskIcon type={data.type} />;

            return (
              <Dialog.Root key={index}>
                <Dialog.Trigger asChild>
                  <div
                    key={index}
                    className="flex hover:bg-[color:var(--figma-color-bg-secondary)] items-center gap-2 p-3"
                  >
                    {/* <GripVertical size={12} className='text-neutral-300' /> */}
                    <SyncTaskIcon type={data.type} />

                    {data?.type === 'github'
                      ? (data?.config as GitHubSyncConfig).repository
                      : data?.type === 'slack'
                      ? `Channel ID: ${(data?.config as SlackSyncConfig).channelId}`
                      : data?.type === 'custom'
                      ? (data.config as CustomHTTPSyncConfig).address
                      : null}

                    <button
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newOptions = setting?.syncTasks?.filter((o, i) => i !== index);
                        sendMessage('SET_PLUGIN_SETTING', { syncTasks: newOptions });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="dialog-overlay" />
                  <Dialog.Content className="dialog-content h-fit">
                    <Dialog.Title className="dialog-title">Edit</Dialog.Title>
                    <SyncForm
                      defaultData={data.config as any}
                      type={data.type}
                      onSubmit={(d) => {
                        const tasks = [...setting?.syncTasks];
                        tasks.splice(index, 1, {
                          config: { ...d },
                          type: data.type,
                          enabled: tasks[index].enabled,
                        });
                        sendMessage('SET_PLUGIN_SETTING', { syncTasks: tasks });
                      }}
                    />
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            );
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center">No Sync tasks</div>
        )}
      </div>
    </div>
  );
}
