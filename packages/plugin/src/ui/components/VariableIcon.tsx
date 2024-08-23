import { Color } from '../icons/Color';
import { Number } from '../icons/Number';
import { Boolean } from '../icons/Boolean';
import { String } from '../icons/String';

export function VariableIcon({ resolvedType }: { resolvedType: Variable['resolvedType'] }) {
  switch (resolvedType) {
    case 'COLOR':
      return <Color />;
    case 'FLOAT':
      return <Number />;
    case 'BOOLEAN':
      return <Boolean />;
    case 'STRING':
      return <String />;
    default:
      return null;
  }
}
