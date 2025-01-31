import { Position } from '@xyflow/react';
import { Handle } from '@xyflow/react';
import { memo } from 'react';
import { MESSAGE_TYPE, sendMessage } from '../../../utils/message';
import { HexColorInput } from 'react-colorful';
import { convertFigmaRGBtoHexString, convertHexColorToFigmaRGBA } from '../../../utils/color';
import { VariablePill } from '../VariablePill';

export default memo(
  ({ data }: { data: { variable: Variable; label: string; value: VariableValue } }) => {
    const renderValue = () => {
      switch (typeof data.value) {
        case 'string':
          return (
            <input
              type="text"
              defaultValue={data.value}
              onBlur={(e) => {
                sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE_VALUE, {
                  id: data.variable.id,
                  modeId: data.label,
                  value: e.target.value,
                });
              }}
            />
          );
        case 'number':
          return <input type="number" value={data.value} />;
        case 'boolean':
          return (
            <input
              onChange={(e) => {
                sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE_VALUE, {
                  id: data.variable.id,
                  modeId: data.label,
                  value: e.target.checked,
                });
              }}
              type="checkbox"
              checked={data.value}
            />
          );
        case 'object':
          return 'type' in data.value ? (
            <VariablePill type={data.variable.resolvedType} value={data.variable.name} />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: convertFigmaRGBtoHexString(data.value) }}
              />
              <HexColorInput
                className="w-16"
                prefixed
                alpha
                color={convertFigmaRGBtoHexString(data.value)}
                onBlur={(e) => {
                  sendMessage(MESSAGE_TYPE.UPDATE_VARIABLE_VALUE, {
                    id: data.variable.id,
                    modeId: data.label,
                    value: convertHexColorToFigmaRGBA(e.target.value),
                  });
                }}
              />
            </div>
          );
        default:
          return <div></div>;
      }
    };

    return (
      <>
        <Handle type="source" position={Position.Right} />
        <div className="w-fit h-6 flex items-center px-1 bg-[var(--figma-color-bg)] border rounded-lg">
          {renderValue()}
          {/* <ParsedValue value={data.value} /> */}
        </div>
      </>
    );
  }
);
