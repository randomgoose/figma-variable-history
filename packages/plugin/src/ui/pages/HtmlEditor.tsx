import { useContext } from 'react';
import { AppContext } from '../../AppContext';

export default function HtmlEditor() {
  const { collections, variables, setTab } = useContext(AppContext);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {collections.map(({ name, modes, variableIds, id }) => {
        const _variables = variableIds.map((id) => variables.find((v) => v.id === id));

        return (
          <div
            key={id}
            className="flex-grow overflow-hidden rounded-3xl bg-gray-100 border border-transparent hover:border-[var(--figma-color-border)] cursor-default p-8"
            onClick={() => setTab('editor')}
          >
            <div className="text-2xl font-bold">{name}</div>
            <div className="text-sm text-gray-500">
              <span>{modes.length}</span> modes,{' '}
              {/* <span>{Object.keys(groups).length}</span> groups, */}{' '}
              <span>{_variables.length}</span> variables
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
        );
      })}
    </div>
  );
}
