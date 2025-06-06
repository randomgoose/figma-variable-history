import { useContext, useEffect, useMemo } from 'react';
import Commits from './ui/pages/Commits';
import { AppContext, AppContextProvider } from './AppContext';
import Changes from './ui/pages/Changes';
import Settings from './ui/pages/Settings';
import { Root, List, Trigger, Content } from '@radix-ui/react-tabs';
import { Toaster } from 'sonner';
import { IconSettings } from '@tabler/icons-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import Variables from './ui/pages/Variables';
import { sendMessage } from './utils/message';
import { useTranslation } from './hooks/useTranslation';
import { ResizeHandle } from './ui/components/ResizeHandle';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SwitchToCloudDialog } from './ui/components/SwitchToCloudDialog';
import { DevModeApp } from './DevModeApp';

function Plugin() {
  const { tab, setTab, mode } = useContext(AppContext);
  const { t } = useTranslation();

  useEffect(() => {
    // Refresh the variables when the plugin is focused
    const handleFocus = () => {
      sendMessage('REFRESH');
    };

    addEventListener('focus', handleFocus);
    sendMessage('INIT');

    // Cleanup function to remove the event listener
    return () => {
      removeEventListener('focus', handleFocus);
    };
  }, []);

  const tabs = useMemo(
    () => [
      {
        value: 'changes',
        children: <Changes />,
      },
      {
        value: 'commits',
        children: <Commits />,
      },
      {
        value: 'variables',
        children: <Variables />,
      },
    ],
    []
  );

  return mode === 'default' ? (
    <Root
      className="overflow-hidden w-full h-screen flex flex-col"
      value={tab}
      onValueChange={(value) => setTab(value as any)}
    >
      <List className="tabs-list border-b border-[var(--figma-color-border)] shrink-0 h-10 flex">
        {tabs.map(({ value }) => (
          <Trigger className="tabs-trigger" key={value} value={value}>
            {t(value)}
          </Trigger>
        ))}

        <SwitchToCloudDialog />

        <Trigger
          value="settings"
          className="w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[color:var(--figma-color-bg-secondary)] data-[state=active]:bg-[color:var(--figma-color-bg-secondary)]"
        >
          <IconSettings size={14} />
        </Trigger>
      </List>

      {tabs.map(({ value, children }) => (
        <Content className="grow" value={value} key={value}>
          {children}
        </Content>
      ))}

      <Content value="settings">
        <Settings />
      </Content>
    </Root>
  ) : (
    <DevModeApp />
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <Tooltip.Provider>
          <Toaster />
          <ResizeHandle />
          <Plugin />
        </Tooltip.Provider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
