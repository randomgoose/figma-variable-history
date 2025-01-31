import { memo } from 'react';

export default memo(
  ({ data }: { data: { label: string; modes: string[]; variables: Variable[] } }) => {
    const { label, modes, variables } = data;

    // const groups = useMemo(() => groupBy(variables, (variable) => variable.name.split('/')[0]), [variables]);
    return (
      <>
        <div className="w-96 overflow-hidden rounded-3xl bg-gray-100 border border-transparent hover:border-[var(--figma-color-border)] cursor-default p-8">
          <div className="text-2xl font-bold">{label}</div>
          <div className="text-sm text-gray-500">
            <span>{modes.length}</span> modes,{' '}
            {/* <span>{Object.keys(groups).length}</span> groups, */}{' '}
            <span>{variables.length}</span> variables
          </div>

          <div className="grid grid-cols-3 mt-4 gap-2 text-[10px]">
            {variables.slice(0, 4).map((variable) => (
              <div
                className="border border-transparent hover:border-[var(--figma-color-border)] bg-[var(--figma-color-bg)] rounded-lg p-2 text-ellipsis overflow-hidden"
                key={variable.id}
              >
                {variable.name}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
);
