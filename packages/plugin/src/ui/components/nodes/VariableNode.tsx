import { ParsedValue } from '../ParsedValue';
import { VariableIcon } from '../VariableIcon';
import { useContext } from 'react';
import { AppContext } from '../../../AppContext';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { CornerDownRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { ReactFlowProvider } from '@xyflow/react';
import { VariableAliasGraph } from '../VariableAliasGraph';

function AliasTag({ aliases }: { aliases: Variable[] }) {
  return aliases.length > 0 ? (
    <div className="text-[var(--figma-color-icon-secondary)] -right-4 top-2 h-4 flex items-center justify-center rounded-[5px] bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-tertiary)] px-1">
      <CornerDownRight size={9} className="shrink-0" />
      {aliases.length}
    </div>
  ) : null;
}

export function VariableNode({
  data,
  onDbClick,
}: {
  data: {
    variable: Variable;
    mode?: string;
  };
  onDbClick?: () => void;
}) {
  // const modeId = Object.keys(data.variable.valuesByMode)[0];
  const { collections, variables } = useContext(AppContext);
  const collection = collections.find((c) => c.id === data.variable.variableCollectionId);
  const { selection, setSelection } = useContext(AppContext);

  const aliases = variables.filter((v) =>
    Object.values(v.valuesByMode).find(
      (v) =>
        typeof v === 'object' &&
        'type' in v &&
        v.type === 'VARIABLE_ALIAS' &&
        v.id === data.variable.id
    )
  );

  return (
    <div
      className={clsx(
        'target relative rounded-[5px] flex flex-col items-center w-48 h-fit bg-[var(--figma-color-bg)]',
        { 'active-animation': selection.includes(`variable__${data.variable.id}`) }
      )}
      onClick={() => {
        setSelection([`variable__${data.variable.id}`]);
      }}
      onDoubleClick={onDbClick}
    >
      <div className="border-b h-8 flex items-center px-2 w-full gap-2">
        <VariableIcon resolvedType={data.variable.resolvedType} />
        {data.variable.name}

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <div className="ml-auto">
              <AliasTag aliases={aliases} />
            </div>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-96 overflow-hidden bg-white shadow-elevation-500 rounded-[13px]">
              <div className="h-10 border-b flex items-center px-3 font-medium">
                {data.variable.name}
              </div>
              <ReactFlowProvider>
                <VariableAliasGraph variableId={data.variable.id} />
              </ReactFlowProvider>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <div className="w-full flex flex-col gap-1 cursor-default p-1">
        {Object.entries(data.variable.valuesByMode).map(([modeId]) => {
          const mode = collection?.modes.find((m) => m.modeId === modeId);

          return (
            <div
              key={modeId}
              className={clsx(
                'flex items-center justify-between h-6 pl-1.5 hover:bg-[var(--figma-color-bg-secondary)] rounded-[5px]',
                { 'active-animation': selection.includes(`mode__${data.variable.id}__${modeId}`) }
              )}
              onClick={(e) => {
                e.stopPropagation();
                setSelection([`mode__${data.variable.id}__${modeId}`]);
              }}
            >
              <Popover.Root>
                <Popover.Trigger asChild>
                  <div className="text-[var(--figma-color-text-secondary)]">{mode?.name}</div>
                </Popover.Trigger>
                <Popover.Content className="bg-[var(--figma-color-bg)] border border-[var(--figma-color-border)] shadow-lg">
                  hi
                </Popover.Content>
              </Popover.Root>
              <ParsedValue variable={data.variable} modeId={modeId} option={{ showLabel: false }} />
            </div>
          );
        })}
      </div>
      {/* {data.variable.resolvedType === 'COLOR' ? (
          <ParsedValue variable={data.variable} modeId={modeId} option={{ showLabel: false }} />
        ) : (
          <VariableIcon resolvedType={data.variable.resolvedType} />
        )} */}
      {data?.mode && <span className="text-xs text-gray-500">{data.mode}</span>}
    </div>
  );
}
