import { Handle, Position } from '@xyflow/react';
import { ParsedValue } from '../ParsedValue';
import { VariableIcon } from '../VariableIcon';

export function VariableNode({
  data,
}: {
  data: {
    variable: Variable;
    mode?: string;
    onClick: () => void;
  };
}) {
  const modeId = Object.keys(data.variable.valuesByMode)[0];

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div
        className="border p-2 rounded-md flex items-center"
        style={{ background: 'var(--figma-color-bg)' }}
        onClick={data.onClick}
      >
        {data.variable.resolvedType === 'COLOR' ? (
          <ParsedValue variable={data.variable} modeId={modeId} option={{ showLabel: false }} />
        ) : (
          <VariableIcon resolvedType={data.variable.resolvedType} />
        )}
        {data?.mode && <span className="text-xs text-gray-500">{data.mode}</span>}
        <label htmlFor="text" className="ml-1">
          {data.variable.name}
        </label>
      </div>
      <Handle type="source" position={Position.Right} />
      {/* <Handle type="source" position={Position.Bottom} id="b" /> */}
    </>
  );
}
