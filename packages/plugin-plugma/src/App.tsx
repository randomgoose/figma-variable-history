import { useEffect, useContext } from 'react';
import { Commits } from './ui/pages/Commits';
import { AppContext, AppContextProvider } from './AppContext';
import { Changes } from './ui/pages/Changes';
import { Settings } from './ui/pages/Settings';
import { Root, List, Trigger, Content } from '@radix-ui/react-tabs';
import { Toaster } from 'sonner';

function Plugin() {
  const { commits } = useContext(AppContext);

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
    {
      value: 'settings',
      children: <Settings />,
    },
  ];

  return (
    <Root defaultValue="changes">
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
      </List>
      {tabs.map(({ value, children }) => (
        <Content value={value} key={value}>
          {children}
        </Content>
      ))}
    </Root>
    // <Tabs
    //   onValueChange={(value) => setTab(value)}
    //   options={[
    //     {
    //       value: 'Changes',
    //       children: <Changes />,
    //     },
    //     {
    //       value: 'Commits',
    //       children: <Commits commits={commits} />,
    //     },
    //     {
    //       value: 'Sync Git',
    //       children: <Settings />,
    //     },
    //   ]}
    //   value={tab}
    // />
  );
}

function App() {
  return (
    <AppContextProvider>
      <Toaster />
      <Plugin />
    </AppContextProvider>
  );
}

export default App;
