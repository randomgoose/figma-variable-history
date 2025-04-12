import { useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { sendMessage } from '../utils/message';

export function useVariableAlias(id: string) {
  const { variableAliases } = useContext(AppContext);

  useEffect(() => {
    if (id && !variableAliases[id]) {
      sendMessage('GET_VARIABLE_BY_ID', id);
    }
  }, [id]);

  if (variableAliases[id]) {
    return variableAliases[id];
  } else {
    return id;
  }
}
