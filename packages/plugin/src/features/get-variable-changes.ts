import { diffVariables } from './diff-variable';

export function getVariableChanges({
  prev = [],
  current = [],
}: {
  prev?: Variable[];
  current?: Variable[];
}): { added: Variable[]; modified: Variable[]; removed: Variable[] } {
  const added = prev
    ? current.filter(({ id: cvId }) => !prev.find(({ id: pvId }) => pvId === cvId))
    : current;
  const modified = prev
    ? current.filter((cv) =>
        prev?.find((pv) => pv.id === cv.id && Object.keys(diffVariables(cv, pv)).length > 0)
      )
    : [];
  const removed = prev.filter((pv) => !current?.find((cv) => cv.id === pv.id));

  return { added, modified, removed };
}
