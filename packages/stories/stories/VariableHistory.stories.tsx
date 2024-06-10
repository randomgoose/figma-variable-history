import * as React from 'preact/compat';
import { useEffect } from 'preact/hooks';
import { App } from 'figma-variable-history/src/ui';

import PluginMain from 'figma-variable-history/src/main';

function Demo() {
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
      <App />
    </div>
  );
}

export default {
  title: 'VariableHistory',
  component: Demo,
};

export const Primary = {};
