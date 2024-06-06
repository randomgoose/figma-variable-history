import { diffVariables } from './diff-variable';

export function getVariableChanges({ prev, current }: { prev?: Variable[]; current: Variable[] }) {
  const added = prev
    ? current?.filter((v) => !prev?.find((vc) => vc.id === v.id))
    : current
    ? current
    : [];
  const modified = prev
    ? current?.filter((v) =>
        prev?.find((vc) => vc.id === v.id && Object.keys(diffVariables(v, vc)).length > 0)
      )
    : [];
  const removed = prev ? prev.filter((v) => !current?.find((vc) => vc.id === v.id)) : [];

  return { added, modified, removed };
}
