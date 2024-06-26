// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { render, Tabs } from '@create-figma-plugin/ui';
import { emit } from '@create-figma-plugin/utilities';
import { useContext, useEffect, useState } from 'preact/hooks';
import { RefreshHandler } from '../types';
import { Commits } from './pages/Commits';
import { AppContext, AppContextProvider } from '../AppContext';
// import { SyncGit } from './components/SyncGit';
import { Changes } from './pages/Changes';
import { Toaster } from 'sonner';
import { Settings } from './pages/Settings';

function Plugin() {
  const { commits } = useContext(AppContext);
  const [tab, setTab] = useState('Changes');

  useEffect(() => {
    // Refresh the variables when the plugin is focused
    addEventListener('focus', () => emit<RefreshHandler>('REFRESH'));
  }, []);

  return (
    <Tabs
      onValueChange={(value) => setTab(value)}
      options={[
        {
          value: 'Changes',
          children: <Changes />,
        },
        {
          value: 'Commits',
          children: <Commits commits={commits} />,
        },
        {
          value: 'Sync Git',
          children: <Settings />,
        },
      ]}
      value={tab}
    />
  );
}

export function App() {
  return (
    <AppContextProvider>
      <Toaster />
      <Plugin />
    </AppContextProvider>
  );
}

export default render(App);
