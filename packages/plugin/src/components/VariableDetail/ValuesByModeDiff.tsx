import { h } from "preact"
import { useAppStore } from "../../store"
import styles from "../../styles.css"
import { ParsedValue } from "../ParsedValue"
import { Dropdown, IconArrowRight16 } from "@create-figma-plugin/ui"
import { isSameVariableValue } from "../../features"

export function ValuesByModeDiff({ current, prev, variables }: { current: Variable, prev: Variable, variables: Variable[] }) {
    const { collections, colorFormat, setColorFormat } = useAppStore()
    const collection = collections.find(c => c.id === current?.variableCollectionId)

    const hasChangedValues = Object.entries(current?.valuesByMode).some(([modeId, value]) => !isSameVariableValue(value, prev.valuesByMode[modeId]))
    const hasNewModes = Object.entries(current?.valuesByMode).some(([modeId]) => !prev.valuesByMode[modeId])
    const hasRemovedModes = Object.entries(prev?.valuesByMode).some(([modeId]) => !current.valuesByMode[modeId])

    console.log(current.name, hasChangedValues, hasNewModes, hasRemovedModes)

    return (hasChangedValues || hasNewModes || hasRemovedModes)
        ? <div className={styles.variableDetail__section} >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h3 className={styles.variableDetail__sectionTitle} style={{ margin: 0, width: '100%' }}>Values</h3>
                <Dropdown
                    value={colorFormat}
                    onChange={(e) => { setColorFormat(e.currentTarget.value === 'RGB' ? 'RGB' : 'HEX') }}
                    options={[{ value: 'RGB' }, { value: 'HEX' }]} style={{ marginLeft: 'auto', width: 64 }} />
            </div>

            {
                Object
                    .entries(current?.valuesByMode)
                    .filter(([modeId, value]) => !isSameVariableValue(value, prev.valuesByMode[modeId]))
                    .map(([modeId, value]) => (
                        <div className={styles.variableDetail__item} key={modeId}>
                            <div>{collection?.modes.find(mode => mode.modeId === modeId)?.name}</div>
                            <div><ParsedValue variable={prev} modeId={modeId} variables={variables} format={colorFormat} /></div>
                            <div className={styles.variableDetail__itemArrow}>
                                <IconArrowRight16 />
                            </div>
                            <div><ParsedValue variable={current} modeId={modeId} variables={variables} format={colorFormat} /></div>
                        </div>
                    ))

            }
        </div>
        : null
}