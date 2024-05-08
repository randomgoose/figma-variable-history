export function parseVariableValue(value: VariableValue, variables: Variable[]): string {
    switch (typeof value) {
        case 'string':
            return value
        case 'number':
            return value.toString()
        case 'boolean':
            return value ? 'true' : 'false'
        case 'undefined':
            return 'undefined'
        case 'object':
            if ('type' in value) {
                const target = variables.find(v => v.id === value.id)
                return target ? target.name : 'undefined'
            } else {
                if ('a' in value) {
                    return `rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${value.a.toFixed(2)})`
                } else {
                    return `rgb(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)})`
                }
            }
        default:
            return String(value)
    }
}