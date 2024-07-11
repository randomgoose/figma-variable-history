import groupBy from 'lodash-es/groupBy';

export function isSameVariable(a: Variable, b: Variable): boolean {
  return a.id === b.id || (a.name === b.name && a.variableCollectionId === b.variableCollectionId);
}

export function isSameVariableValue(a?: VariableValue, b?: VariableValue): boolean {
  if (typeof a === 'object' && typeof b === 'object') {
    // Compare variable aliases
    if ('type' in b && 'type' in a) {
      return a.id === b.id;
    }

    // Compare RGB & RGBA
    if ('r' in a && 'r' in b) {
      // Compare alpha
      if (('a' in a ? a.a : 1) !== ('a' in b ? b.a : 1)) {
        return false;
      }

      return !(['r', 'g', 'b'] as Array<'r' | 'g' | 'b'>).find(
        (key) => Math.round(a[key] * 255) !== Math.round(b[key] * 255)
      );
    }

    return false;
    // Compare variable values that are strings, floats (numbers) or booleans
  } else {
    return a === b;
  }
}

/**
 * Diff value changes of two variables
 */
export function diffVariables(a: Variable, b: Variable) {
  const diff: any = {};

  if (a.name !== b.name) {
    diff.name = [a.name, b.name];
  }

  if (a.description !== b.description) {
    diff.description = [a.description, b.description];
  }

  if (a.resolvedType !== b.resolvedType) {
    diff.resolvedType = [a.resolvedType, b.resolvedType];
  }

  if (
    a.codeSyntax.ANDROID !== b.codeSyntax.ANDROID ||
    a.codeSyntax.WEB !== b.codeSyntax.WEB ||
    a.codeSyntax.iOS !== b.codeSyntax.iOS
  ) {
    diff.codeSyntax = [a.codeSyntax, b.codeSyntax];
  }

  // Compare values by mode
  const valuesByMode = Object.fromEntries(
    Object.entries(a.valuesByMode)
      .map(([modeId]) => {
        if (typeof a.valuesByMode[modeId] === 'undefined') {
          return [modeId, [undefined, b.valuesByMode[modeId]]];
        } else if (typeof b.valuesByMode[modeId] === 'undefined') {
          return [modeId, [a.valuesByMode[modeId], undefined]];
        } else {
          if (!isSameVariableValue(a.valuesByMode[modeId], b.valuesByMode[modeId])) {
            return [modeId, [a.valuesByMode[modeId], b.valuesByMode[modeId]]];
          } else {
            return [modeId, []];
          }
        }
      })
      .filter(([, value]) => value.length > 0)
  );

  if (Object.keys(valuesByMode).length > 0) {
    diff.valuesByMode = valuesByMode;
  }

  return diff;
}

/**
 * Get variable list member changes (modify/add/remove)
 */
export function getVariableChanges({
  prev = [],
  current = [],
}: {
  prev?: Variable[];
  current?: Variable[];
}) {
  // use copy of prev, will splice it below
  prev = [...prev];

  const result: { added: Variable[]; modified: Variable[]; removed: Variable[] } = {
    added: [],
    modified: [],
    removed: [],
  };

  for (const currentItem of current) {
    let hasSameVariableInPrev = false;

    for (let i = 0; i < prev.length; i++) {
      const prevItem = prev[i];
      const isSameOne = isSameVariable(currentItem, prevItem);

      if (isSameOne) {
        const isDifferent = Object.keys(diffVariables(currentItem, prevItem)).length > 0;
        isDifferent && result.modified.push(currentItem);
        hasSameVariableInPrev = true;
        prev.splice(i, 1);
        i--;
        break;
      }
    }

    if (!hasSameVariableInPrev) {
      result.added.push(currentItem);
    }
  }

  result.removed.push(...prev);

  return result;
}

export function getVariableChangesGroupedByCollection({
  prev,
  current,
}: {
  prev?: Variable[];
  current?: Variable[];
}) {
  const groupedCurrent = groupBy(current, (d) => d.variableCollectionId);
  const groupedPrev = groupBy(prev, (d) => d.variableCollectionId);
  // TODO: Removed collection will not be shown
  return Object.fromEntries(
    Object.entries(groupedCurrent).map(([collectionId, variables]) => [
      collectionId,
      getVariableChanges({ prev: groupedPrev[collectionId] || [], current: variables }),
    ])
  );
}
