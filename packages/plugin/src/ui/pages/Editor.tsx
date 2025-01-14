import { useContext } from 'react';
import { AppContext } from '../../AppContext';

export function Editor() {
  const { variables } = useContext(AppContext);

  return (
    <div>
      <div className="flex flex-col gap-2">
        {variables.map((v) => (
          <div key={v.id}>{v.name}</div>
        ))}
      </div>
    </div>
  );
}
