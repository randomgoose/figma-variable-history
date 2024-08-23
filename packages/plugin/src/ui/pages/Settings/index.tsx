import { useState } from 'react';
import { Synchronization } from './Synchronization';
import { IconRefresh } from '@tabler/icons-react';
import clsx from 'clsx';

const settingConfig = [
  {
    label: 'Synchronization',
    component: <Synchronization />,
    icon: <IconRefresh size={14} className="mr-2" />,
  },
  // {
  //   label: 'Language',
  //   component: <div>hi</div>,
  //   icon: <IconWorld size={14} className='mr-2' />
  // }
];

export function Settings() {
  const [page, setPage] = useState('Synchronization');

  return (
    <div style={{ height: 'calc(100% - 40px)' }}>
      <div
        className="h-10 px-4 flex items-center border-b"
        style={{ borderColor: 'var(--figma-color-border)' }}
      >
        <h3 className={'text-[13px] font-medium text-[color:var(--figma-color-text)]'}>Settings</h3>
      </div>

      <div className="flex h-full">
        <div className="p-2 w-60" style={{ backgroundColor: 'var(--figma-color-bg-secondary)' }}>
          {settingConfig.map(({ label, icon }) => (
            <div
              key={label}
              className={clsx(
                'cursor-default h-10 flex items-center px-3 text-xs rounded-md hover:bg-[color:var(--figma-color-bg)] mt-1 first:mt-0 active:scale-[99%] transition-all',
                page === label
                  ? 'bg-[color:var(--figma-color-bg)] text-[color:var(--figma-color-text)] shadow-sm'
                  : 'text-[color:var(--figma-color-text-secondary)]'
              )}
              onClick={() => setPage(label)}
            >
              {icon}
              {label}
            </div>
          ))}
        </div>

        <div className="grow p-4 overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
          {settingConfig.find(({ label }) => label === page)?.component}
        </div>
      </div>

      {/* <div className='p-4 overflow-auto' style={{ height: 'calc(100% - 40px)' }}>
        <h3 className='text-xs font-semibold'>Synchronization</h3>

        <button onClick={() => { sendMessage('CLEAR_PLUGIN_DATA') }}>Clear</button>

        {
          setting?.syncOptions?.length > 0
            ? setting?.syncOptions?.map(({ option, enabled }, index) => (
              <div key={index} className='p-4 rounded-[4px] border border-[color:var(--figma-color-border)] mt-2'>
                <div className={'flex items-center gap-2'}>
                  {option.type}
                  <div>
                    <div className={'font-medium'}>{option.type}</div>
                    <div className={'text-[color:var(--figma-color-text-secondary)]'}>{option.type}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Switch.Root
                      className="switch-root"
                      checked={enabled}
                      onCheckedChange={(checked) => sendMessage('SET_PLUGIN_SETTING', { [type]: { ...setting, enabled: checked } })}>
                      <Switch.Thumb className="switch-thumb" />
                    </Switch.Root>
                  </div>
                </div>

                {
                  enabled
                    ? <div className='px-8 py-4'>
                      {syncComponentMap[option.type]}
                    </div>
                    : null
                }
              </div>
            )) : null
        }

        <button>Add</button>
      </div> */}
    </div>
  );
}
