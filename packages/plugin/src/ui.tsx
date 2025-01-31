import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router';
import './styles.css';
import AppLayout from './AppLayout.tsx';
import { Changes } from './ui/pages/Changes.tsx';
import HtmlEditor from './ui/pages/HtmlEditor.tsx';
import { Variables } from './ui/pages/Variables.tsx';
import { Commits } from './ui/pages/Commits.tsx';
import { Settings } from './ui/pages/Settings/index.tsx';
import { AppContextProvider } from './AppContext.tsx';
import { Editor } from './ui/pages/Editor.tsx';

const root = createRoot(document.getElementById('app') || document.createElement('div'));
root.render(
  <AppContextProvider>
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Changes />} />
          <Route path="editor" element={<HtmlEditor />} />
          <Route path="editor/:collectionId" element={<Editor />} />
          <Route path="commits" element={<Commits />} />
          <Route path="variables" element={<Variables />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  </AppContextProvider>
);
