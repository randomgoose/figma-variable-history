function diffVariableValue(a: VariableValue, b: VariableValue) {
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
                    if (Math.round(a.r) !== b.r) {
                        return false
                    }

                    if (a.g !== b.g) {
                        return false
                    }

                    if (a.b !== b.b) {
                        return false
                    }
                }
            }
            else {
                return false
            }
        }
    }
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

    // Compare values by mode
    const valuesByMode = Object.fromEntries(
        Object
            .entries(a.valuesByMode)
            .map(([modeId, value]) => {
                if (!a.valuesByMode[modeId]) {
                    return [modeId, [undefined, b.valuesByMode[modeId]]]
                } else if (!b.valuesByMode[modeId]) {
                    return [modeId, [a.valuesByMode[modeId], undefined]]
                }
                else {
                    return [modeId, [a.valuesByMode[modeId], b.valuesByMode[modeId]]]
                }
            }))

            console.log(valuesByMode)
    return diff
}