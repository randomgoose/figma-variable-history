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
        if (!a.valuesByMode[modeId]) {
          return [modeId, [undefined, b.valuesByMode[modeId]]];
        } else if (!b.valuesByMode[modeId]) {
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
