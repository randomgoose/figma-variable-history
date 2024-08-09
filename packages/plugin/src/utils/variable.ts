import { difference, union } from 'lodash-es';
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
export function diffVariables(
  a: { variable: Variable; collection?: VariableCollection },
  b: { variable: Variable; collection?: VariableCollection }
) {
  const diff: any = {};

  if (a.variable.name !== b.variable.name) {
    diff.name = [a.variable.name, b.variable.name];
  }

  if (a.variable.description !== b.variable.description) {
    diff.description = [a.variable.description, b.variable.description];
  }

  if (a.variable.resolvedType !== b.variable.resolvedType) {
    diff.resolvedType = [a.variable.resolvedType, b.variable.resolvedType];
  }

  if (
    difference(a.variable.scopes, b.variable.scopes).length > 0 ||
    (a.variable.scopes.length === 0 && b.variable.scopes.length > 0) ||
    (a.variable.scopes.length > 0 && b.variable.scopes.length === 0)
  ) {
    diff.scopes = [a.variable.scopes, b.variable.scopes];
  }

  if (
    a.variable.codeSyntax.ANDROID !== b.variable.codeSyntax.ANDROID ||
    a.variable.codeSyntax.WEB !== b.variable.codeSyntax.WEB ||
    a.variable.codeSyntax.iOS !== b.variable.codeSyntax.iOS
  ) {
    diff.codeSyntax = [a.variable.codeSyntax, b.variable.codeSyntax];
  }

  // Compare values by mode
  const valuesByMode = Object.fromEntries(
    Object.entries({ ...a.variable.valuesByMode, ...b.variable.valuesByMode })
      .map(([modeId]) => {
        const aModeName = a.collection?.modes.find((mode) => mode.modeId === modeId)?.name;
        const bModeName = b.collection?.modes.find((mode) => mode.modeId === modeId)?.name;

        if (typeof a.variable.valuesByMode[modeId] === 'undefined') {
          const sameNameMode = a.collection?.modes.find((mode) => mode.name === bModeName);
          if (!sameNameMode) {
            return [modeId, [undefined, b.variable.valuesByMode[modeId]]];
          } else {
            if (
              !isSameVariableValue(
                a.variable.valuesByMode[sameNameMode.modeId],
                b.variable.valuesByMode[modeId]
              )
            ) {
              return [
                modeId,
                [a.variable.valuesByMode[sameNameMode.modeId], b.variable.valuesByMode[modeId]],
              ];
            } else {
              return [modeId, []];
            }
          }
        } else if (typeof b.variable.valuesByMode[modeId] === 'undefined') {
          const sameNameMode = b.collection?.modes.find((mode) => mode.name === aModeName);
          if (!sameNameMode) {
            return [modeId, [a.variable.valuesByMode[modeId], undefined]];
          } else {
            if (
              !isSameVariableValue(
                a.variable.valuesByMode[modeId],
                b.variable.valuesByMode[sameNameMode.modeId]
              )
            ) {
              return [
                modeId,
                [a.variable.valuesByMode[modeId], b.variable.valuesByMode[sameNameMode.modeId]],
              ];
            } else {
              return [modeId, []];
            }
          }
        } else {
          if (
            !isSameVariableValue(a.variable.valuesByMode[modeId], b.variable.valuesByMode[modeId])
          ) {
            return [modeId, [a.variable.valuesByMode[modeId], b.variable.valuesByMode[modeId]]];
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
  prev = { variables: [], collections: [] },
  current = { variables: [], collections: [] },
}: {
  prev?: { variables: Variable[]; collections: VariableCollection[] };
  current?: { variables: Variable[]; collections: VariableCollection[] };
}) {
  // use copy of prev, will splice it below
  prev.variables = [...prev.variables];

  const result: { added: Variable[]; modified: Variable[]; removed: Variable[] } = {
    added: [],
    modified: [],
    removed: [],
  };

  for (const currentItem of current.variables) {
    let hasSameVariableInPrev = false;

    for (let i = 0; i < prev.variables.length; i++) {
      const prevItem = prev.variables[i];
      const isSameOne = isSameVariable(currentItem, prevItem);
      const prevCollection = prev.collections.find((c) => prevItem.variableCollectionId === c.id);
      const currentCollection = current.collections.find(
        (c) => currentItem.variableCollectionId === c.id
      );

      if (isSameOne) {
        const isDifferent =
          Object.keys(
            diffVariables(
              { variable: currentItem, collection: currentCollection },
              { variable: prevItem, collection: prevCollection }
            )
          ).length > 0;
        isDifferent && result.modified.push(currentItem);
        hasSameVariableInPrev = true;
        prev.variables.splice(i, 1);
        i--;
        break;
      }
    }

    if (!hasSameVariableInPrev) {
      result.added.push(currentItem);
    }
  }

  result.removed.push(...prev.variables);

  return result;
}

export function getVariableChangesGroupedByCollection({
  prev,
  current,
}: {
  prev: { variables: Variable[]; collections: VariableCollection[] };
  current: { variables: Variable[]; collections: VariableCollection[] };
}) {
  const groupedCurrent = groupBy(current?.variables, (d) => d.variableCollectionId);
  const groupedPrev = groupBy(prev?.variables, (d) => d.variableCollectionId);
  const unionedKeys = union(Object.keys(groupedCurrent), Object.keys(groupedPrev));

  return Object.fromEntries(
    unionedKeys.map((collectionId) => {
      return [
        collectionId,
        getVariableChanges({
          prev: {
            variables: groupedPrev[collectionId] || [],
            collections: prev?.collections,
          },
          current: {
            variables: groupedCurrent[collectionId] || [],
            collections: current.collections,
          },
        }),
      ];
    })
  );
}

export function isAlias(value: VariableValue) {
  if (typeof value === 'object' && 'type' in value && value.type === 'VARIABLE_ALIAS') {
    return true;
  } else {
    return false;
  }
}
