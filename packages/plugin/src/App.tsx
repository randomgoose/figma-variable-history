import { useEffect, useContext } from 'react';
import { Commits } from './ui/pages/Commits';
import { AppContext, AppContextProvider } from './AppContext';
import { Changes } from './ui/pages/Changes';
import { Settings } from './ui/pages/Settings';
import { Root, List, Trigger, Content } from '@radix-ui/react-tabs';
import { Toaster } from 'sonner';
import { Settings2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

function Plugin() {
  const { commits, tab, setTab } = useContext(AppContext);

  useEffect(() => {
    // Refresh the variables when the plugin is focused
    addEventListener('focus', () => {
      parent.postMessage({ pluginMessage: { type: 'REFRESH' }, pluginId: '*' }, '*');
    });

    parent.postMessage({ pluginMessage: { type: 'INIT' }, pluginId: '*' }, '*');
  }, []);

  const tabs = [
    {
      value: 'changes',
      children: <Changes />,
    },
    {
      value: 'commits',
      children: <Commits commits={commits} />,
    },
  ];

  return (
    <Root value={tab} onValueChange={(value) => setTab(value as any)}>
      <List className="px-2 h-10 flex items-center border-b">
        {tabs.map(({ value }) => (
          <Trigger
            className="cursor-default text-[color:var(--figma-color-text-secondary)] data-[state=active]:font-semibold data-[state=active]:text-[color:var(--figma-color-text)] px-2 capitalize"
            key={value}
            value={value}
          >
            {value}
          </Trigger>
        ))}

        <Trigger
          value="settings"
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-sm hover:bg-[color:var(--figma-color-bg-secondary)] data-[state=active]:bg-[color:var(--figma-color-bg-secondary)]"
        >
          <Settings2 size={14} />
        </Trigger>
      </List>
      {tabs.map(({ value, children }) => (
        <Content value={value} key={value}>
          {children}
        </Content>
      ))}

      <Content value="settings">
        <Settings />
      </Content>
    </Root>
  );
}

function App() {
  return (
    <AppContextProvider>
      <Tooltip.Provider>
        <Toaster />
        <Plugin />
      </Tooltip.Provider>
    </AppContextProvider>
  );
}

export default App;
