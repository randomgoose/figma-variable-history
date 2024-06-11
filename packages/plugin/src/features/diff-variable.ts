export function isSameVariableValue(a?: VariableValue, b?: VariableValue): boolean {
    if (typeof a !== typeof b) {
        return false
    }

    else if (typeof a === typeof b) {
        // Compare variable values that are strings, floats (numbers) or booleans
        if (typeof a !== 'object') {
            return a === b
        }

        else {
            if (typeof b === 'object') {

                // Compare variable aliases
                if ('type' in b && 'type' in a) {
                    return a.id === b.id
                }

                // Compare RGB & RGBA
                else if ('r' in a && 'r' in b) {
                    if (Math.round(a.r * 255) !== Math.round(b.r * 255)) {
                        return false
                    }

                    if (Math.round(a.g * 255) !== Math.round(b.g * 255)) {
                        return false
                    }

                    if (Math.round(a.b * 255) !== Math.round(b.b * 255)) {
                        return false
                    }

                    return true
                }
            }

            else {
                return false
            }
        }
    }

    return false
}

export function diffVariables(a: Variable, b: Variable) {
    let diff: any = {}


    if (a.name !== b.name) {
        diff.name = [a.name, b.name]
    }

    if (a.description !== b.description) {
        diff.description = [a.description, b.description]
    }

    if (a.resolvedType !== b.resolvedType) {
        diff.resolvedType = [a.resolvedType, b.resolvedType]
    }

    if ((a.codeSyntax.ANDROID !== b.codeSyntax.ANDROID) || (a.codeSyntax.WEB !== b.codeSyntax.WEB) || (a.codeSyntax.iOS !== b.codeSyntax.iOS)) {
        diff.codeSyntax = [a.codeSyntax, b.codeSyntax]
    }

    // Compare values by mode
    const valuesByMode = Object.fromEntries(
        Object
            .entries(a.valuesByMode)
            .map(([modeId]) => {
                if (a.valuesByMode[modeId] === undefined) {
                    return [modeId, [undefined, b.valuesByMode[modeId]]]
                }
                else if (b.valuesByMode[modeId] === undefined) {
                    return [modeId, [a.valuesByMode[modeId], undefined]]
                }
                else {
                    if (!isSameVariableValue(a.valuesByMode[modeId], b.valuesByMode[modeId])) {
                        return [modeId, [a.valuesByMode[modeId], b.valuesByMode[modeId]]]
                    } else {
                        return [modeId, []]
                    }
                }
            })
            .filter(([, value]) => value.length > 0)
    )

    if (Object.keys(valuesByMode).length > 0) {
        diff.valuesByMode = valuesByMode
    }

    return diff
}