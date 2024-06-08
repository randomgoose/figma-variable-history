import * as React from 'preact/compat';
import { useEffect } from 'preact/hooks';
import { Plugin } from 'figma-variable-history/src/ui';

import PluginMain from 'figma-variable-history/src/main';

function App() {
  useEffect(() => {
    PluginMain();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Plugin />
    </div>
  );
}

export default {
  title: 'VariableHistory',
  component: App,
};

export const Primary = {};
