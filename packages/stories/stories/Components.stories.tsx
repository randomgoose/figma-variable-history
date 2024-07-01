import * as React from 'preact/compat';
import { VariablePill } from 'figma-variable-history/src/ui/components/VariablePill';

function Components() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <VariablePill type="COLOR" value="background/primary" />
      <VariablePill type="STRING" value="text/introduction" />
      <VariablePill type="FLOAT" value="spacing/small" />
      <VariablePill type="FLOAT" value="isOpen" />
      <VariablePill type="TRUE" value="isOpen" />
      <VariablePill type="FALSE" value="isOpen" />
    </div>
  );
}

export default {
  title: 'Components',
  component: Components,
};

export const Primary = {};
