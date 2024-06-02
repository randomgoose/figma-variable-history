import { h } from "preact"
import styles from "../styles.css"
import { convertRgbColorToHexColor, emit } from "@create-figma-plugin/utilities";
import { convertFigmaRgbtoString, copyText } from "../features";
import { useEffect } from "preact/hooks";
import { GetVariableByIdHander, ResolveVariableValueHandler } from "../types";
import { useAppStore } from "../store";

export function ParsedValue({ variable, modeId, variables, format }: { variable: Variable, modeId: string, variables: Variable[]; format?: 'RGB' | 'HEX' }) {
    const value = variable.valuesByMode[modeId]

    const { resolvedVariableValues, variableAliases } = useAppStore()

    useEffect(() => {
        if (typeof value === 'object' && 'type' in value) {
            emit<ResolveVariableValueHandler>("RESOLVE_VARIABLE_VALUE", { variable, modeId })
            emit<GetVariableByIdHander>("GET_VARIABLE_BY_ID", value.id)
        }
    }, [value, variable])

    let v: string = ''

    switch (typeof value) {
        case 'string':
            v = value
            break
        case 'number':
            v = value.toString()
            break
        case 'boolean':
            v = value ? 'true' : 'false'
            break
        case 'undefined':
            return <div style={{ color: 'var(--figma-color-text-secondary)' }}>Not defined</div>
        case 'object':
            if ('type' in value) {
                const alias = variableAliases[value.id]
                const resolvedValue = resolvedVariableValues[variable.id]?.valuesByMode[modeId].value

                if (alias) {
                    switch (typeof resolvedValue) {
                        case 'object':
                            if ('r' in resolvedValue) {
                                const { r, g, b } = resolvedValue

                                let a = 1;

                                if ('a' in resolvedValue) {
                                    a = resolvedValue.a
                                }
                                return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className={styles.parsedValue}>
                                    <div className={styles.swatch} style={{ background: convertFigmaRgbtoString({ r, g, b }) }} />
                                    <div className={styles.variable__pill}>{alias}</div>
                                </div>
                            } else {
                                return null
                            }
                    }
                } else {
                    return <div>undefined</div>
                }
            } else {
                if ('a' in value) {
                    const _r = Math.round(value.r * 255)
                    const _g = Math.round(value.g * 255)
                    const _b = Math.round(value.b * 255)
                    const v = format === 'RGB' ? `rgba(${_r}, ${_g}, ${_b}, ${(value.a * 100).toFixed(0) + '%'})` : `#${convertRgbColorToHexColor({ r: value.r, g: value.g, b: value.b })}`

                    return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => copyText(v)} className={styles.parsedValue}>
                        <div className={styles.swatch} style={{ background: convertFigmaRgbtoString({ r: _r, g: _g, b: _b, a: value.a }) }} />
                        {v}
                    </div>
                } else {
                    return <div>rgb({Math.round(value.r * 255)}, {Math.round(value.g * 255)}, {Math.round(value.b * 255)})</div>
                }
            }
        default:
            return <div>{String(value)}</div>
    }

    return <div onClick={() => { copyText(v) }}>{v}</div>
}