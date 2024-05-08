import { h } from 'preact'
import { Checkbox, Divider, IconArrowRight16, IconButton, IconChevronLeft32, Text } from '@create-figma-plugin/ui'
import { route } from 'preact-router'
import styles from '../styles.css'
import { useAppStore } from '../store'
import { intersection } from 'lodash-es'
import { ParsedValue } from './ParsedValue'

function Arrow() {
    return (
        <div className={styles.variableDetail__itemArrow}>
            <IconArrowRight16 />
        </div>
    )
}

function VariableScopes({ variable }: { variable: Variable }) {
    let scopes: { label: string; sub?: boolean; scopes: VariableScope[] }[] = [];

    switch (variable.resolvedType) {
        default:
            scopes = [
                { label: 'Show in all supported properties', scopes: ['ALL_SCOPES'] },
                { label: 'Fill', scopes: ['ALL_SCOPES', 'ALL_FILLS'] },
                { label: 'Frame', scopes: ['ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL'], sub: true },
                { label: 'Shape', scopes: ['ALL_SCOPES', 'ALL_FILLS', 'SHAPE_FILL'], sub: true },
                { label: 'Text', scopes: ['ALL_SCOPES', 'ALL_FILLS', 'TEXT_FILL'], sub: true },
                { label: 'Stroke', scopes: ['ALL_SCOPES', 'STROKE_COLOR'] },
                { label: 'Effect', scopes: ['ALL_SCOPES', 'EFFECT_COLOR'] },
            ]
    }

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        {scopes.map(({ label, scopes, sub }) =>
            <div style={{ height: 32, display: 'flex', alignItems: 'center', paddingLeft: sub ? 24 : 0 }}>
                <Checkbox disabled onValueChange={() => { return; }} key={label} value={intersection(scopes, variable.scopes).length > 0}>
                    <Text>{label}</Text>
                </Checkbox>
            </div>
        )}
    </div>
}

export function VariableDetail(props: any) {
    const { id } = props
    const { variables, collections, commits } = useAppStore()

    const current = variables.find(v => v.id === id)
    const prev = commits[0]?.variables.find(v => v.id === id)

    const collection = collections.find(c => c.id === current?.variableCollectionId)

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.variableDetail__header}>
                <IconButton onClick={() => route('/')}>
                    <IconChevronLeft32 />
                </IconButton>
                
                {/* Name */}
                <div>
                    {current?.name}
                    {/* {prev?.name} */}
                </div>
            </div>


            <div style={{ overflow: 'scroll' }}>
                <div className={styles.variableDetail__section}>
                    <h3 className={styles.variableDetail__sectionTitle}>Values</h3>

                    {
                        current?.valuesByMode
                            ? Object.entries(current?.valuesByMode).map(([modeId, value]) => (
                                <div className={styles.variableDetail__item} key={modeId}>
                                    <div>{collection?.modes.find(mode => mode.modeId === modeId)?.name}</div>
                                    <div>{prev?.valuesByMode[modeId] ? <ParsedValue value={prev?.valuesByMode[modeId]} variables={variables} /> : null}</div>
                                    <Arrow />
                                    <div><ParsedValue value={value} variables={variables} /></div>
                                </div>
                            ))
                            : null
                    }
                </div>

                {/* Description */}
                <div className={styles.variableDetail__section}>
                    <div className={styles.variableDetail__item}>
                        <h3 className={styles.variableDetail__sectionTitle} style={{ margin: 0, lineHeight: 1 }}>Description</h3>
                        <div>{prev?.description}</div>
                        <Arrow />
                        <div style={{ textAlign: 'left' }}>{current?.description}</div>
                    </div>
                </div>

                {/* Code Syntax */}
                <div className={styles.variableDetail__section}>
                    <h3 className={styles.variableDetail__sectionTitle}>Code Syntax</h3>
                    {
                        current?.codeSyntax ?
                            Object.entries(current?.codeSyntax).map(([platform, value]) => (
                                <div className={styles.variableDetail__item} key={platform}>
                                    <div>{platform}</div>
                                    <div>{value}</div>
                                    <Arrow />
                                    <div>{value}</div>
                                </div>
                            )) : null
                    }
                </div>

                <div className={styles.variableDetail__section}>
                    <h3 className={styles.variableDetail__sectionTitle}>Color Scoping</h3>
                    {/* <div className={styles.variableDetail__item}> */}
                    {
                        current ? <VariableScopes variable={current} /> : null
                    }
                    {/* </div> */}
                </div>

            </div>
        </div>
    )
}