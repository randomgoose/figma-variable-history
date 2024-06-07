import * as React from 'preact/compat';
import { Plugin } from 'figma-variable-history/src/ui';

import '@create-figma-plugin/ui/css/fonts.css';
import '@create-figma-plugin/ui/css/theme.css';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 300,
      }}
      className="figma-light"
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
