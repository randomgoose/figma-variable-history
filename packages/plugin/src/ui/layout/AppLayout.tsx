import * as Tooltip from '@radix-ui/react-tooltip';
import { Link, Outlet, useLocation } from 'react-router';
import { useEffect, useMemo } from 'react';
import { sendMessage } from '../../utils/message';
import clsx from 'clsx';
import { Toaster } from 'sonner';
import { CMDK } from '../components/CMDK';
import { useTranslation } from '../../hooks/useTranslation';

export default function AppLayout() {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      { label: t('editor'), path: '/' },
      { label: t('changes'), path: '/changes' },
      { label: t('commits'), path: '/commits' },
      { label: t('variables'), path: '/variables' },
      { label: t('settings'), path: '/settings' },
    ],
    [t]
  );

  useEffect(() => {
    // Refresh the variables when the plugin is focused
    addEventListener('focus', () => {
      sendMessage('REFRESH');
    });

    parent.postMessage({ pluginMessage: { type: 'INIT' }, pluginId: '*' }, '*');
  }, []);

  return (
    <Tooltip.Provider>
      <div>
        <div className="flex items-center border-b border-[var(--figma-color-border)] px-2 h-10">
          {tabs.map(({ label, path }) => (
            <Link
              className={clsx(
                'cursor-default px-2 capitalize h-6 flex items-center',
                path === location.pathname
                  ? 'bg-[var(--figma-color-bg-secondary)] font-semibold text-[var(--figma-color-text)] rounded-[5px]'
                  : 'text-[var(--figma-color-text-secondary)]'
              )}
              key={label}
              to={path}
            >
              {label}
            </Link>
          ))}
        </div>
        <Outlet />
        <Toaster />
        <CMDK />
      </div>
    </Tooltip.Provider>
  );
}
