import { h } from "preact"
import styles from "../styles.css"

export function ParsedValue({ value, variables }: { value: VariableValue, variables: Variable[] }) {
    switch (typeof value) {
        case 'string':
            return <div>{value}</div>
        case 'number':
            return <div>{value.toString()}</div>
        case 'boolean':
            return <div>{value ? 'true' : 'false'}</div>
        case 'undefined':
            return <div>undefined</div>
        case 'object':
            if ('type' in value) {
                const target = variables.find(v => v.id === value.id)
                return target
                    ? <div className={styles.variable__pill}>{target.name}</div>
                    : <div>undefined</div>
            } else {
                if ('a' in value) {
                    return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className={styles.swatch} style={{ background: `rgba(${Math.round(value.r * 255)}, ${Math.round(value.g * 255)}, ${Math.round(value.b * 255)}, ${value.a.toFixed(2)})` }} />
                        rgba({Math.round(value.r * 255)}, {Math.round(value.g * 255)}, {Math.round(value.b * 255)}, {(value.a * 100).toFixed(0) + '%'})
                    </div>
                } else {
                    return <div>rgb({Math.round(value.r * 255)}, {Math.round(value.g * 255)}, {Math.round(value.b * 255)})</div>
                }
            }
        default:
            return <div>{String(value)}</div>
    }
}