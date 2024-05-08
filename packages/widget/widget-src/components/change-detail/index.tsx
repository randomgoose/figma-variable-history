import { Menu, MenuItem, MenuList, MenuTrigger, colors } from 'fidget-ui'
import { ChangeType, IChange, ICommit } from '../../types'
import { IconArrowRightSolid, IconChevronDownSolid } from 'fidget-ui/icons'
import { PREFIX } from '../../constants'
import deepEqual from 'deep-equal'
import { cloneObject } from '@create-figma-plugin/utilities'
import { convertRgbColorToHexColor } from '@create-figma-plugin/utilities'
import { ChangeTypeTag } from '../change-type-tag'

const { AutoLayout: Flex, Text, useEffect, useSyncedState, Span } = figma.widget

const styles: {
    entry: AutoLayoutProps
} = {
    entry: {
        minHeight: 40,
        verticalAlignItems: 'center',
        width: 'fill-parent',
        fill: colors.white,
        effect: [{ type: "drop-shadow", offset: { y: 1, x: 0 }, color: colors.neutral[200], blur: 0 }]
    }
}

function Label({ children }: { children: string }) {
    return (
        <Flex padding={{ horizontal: 16 }} verticalAlignItems='center' height={24} width={'fill-parent'}>
            <Text fontSize={11} fill={colors.neutral[900]} fontWeight={"bold"}>{children}</Text>
        </Flex>
    )
}

function Entry({ oldValue, newValue, name, fallback }: { oldValue?: string | FigmaDeclarativeNode; newValue?: string | FigmaDeclarativeNode; name?: string; fallback?: string }) {

    return <Flex {...styles.entry} name='Entry' wrap>
        <Flex padding={{ horizontal: 16 }} verticalAlignItems='center' width={'fill-parent'} wrap>
            {name ? <Text fontSize={11} fill={colors.neutral[500]} width={'fill-parent'}>{name}</Text> : null}
            {
                oldValue
                    ? typeof oldValue === 'string' ? <Text width={'fill-parent'} fontSize={11}>{oldValue}</Text> : oldValue
                    : null
            }
            {
                (oldValue && newValue)
                    ? (
                        <Flex width={32} height={32} verticalAlignItems={'center'} horizontalAlignItems={'center'}>
                            <IconArrowRightSolid width={10} height={10} color={colors.neutral[400]} />
                        </Flex>
                    )
                    : null
            }
            {
                newValue
                    ? typeof newValue === 'string' ? <Text width={'fill-parent'} fontSize={11}>{newValue}</Text> : newValue
                    : null
            }
            {
                !newValue && !oldValue && fallback && <Text fontSize={11} fill={colors.neutral[500]}>{fallback}</Text>
            }
        </Flex>
    </Flex>
}

export function ChangeDetail({ change, variables, showHeader }: { change: IChange; variables: Variable[]; showHeader: boolean }) {
    const [varialeCollection, setVariableCollection] = useSyncedState<VariableCollection | null>(`${PREFIX}_changes_variableCollection`, null)
    const [colorFormat, setColorFormat] = useSyncedState<"HEX" | "RGB" | "HSV">(`${PREFIX}_changes_colorFormat`, 'HEX');

    useEffect(() => {
        const c = figma.variables.getLocalVariableCollections().find(c => c.id === change.variableCollectionId[0]);

        if (c) {
            if (!deepEqual(cloneObject(varialeCollection), cloneObject(c))) {
                setVariableCollection(cloneObject(c))
            }
        }
    })

    function renderValue(value: VariableValue) {
        switch (typeof value) {
            case "object":
                if (value === null) {

                } else {
                    if ('type' in value) {
                        return (
                            <>
                                <Flex height={20} fill={{ r: 245 / 255, g: 245 / 255, b: 245 / 255, a: 1 }} padding={{ horizontal: 5 }} cornerRadius={4} verticalAlignItems='center' horizontalAlignItems={'center'} stroke={{ r: 230 / 255, g: 230 / 255, b: 230 / 255, a: 1 }}>
                                    <Text fontSize={11}>{variables.find(({ id }) => id === value.id)?.name}</Text>
                                </Flex>
                            </>
                        )
                    } else {
                        return <Flex verticalAlignItems='center' spacing={4} overflow='visible'>
                            <Flex width={12} height={12} fill={{ ...value, a: 1 }} cornerRadius={2} stroke={{ r: 0, g: 0, b: 0, a: 0.1 }} />
                            <Text fontSize={11} fill={colors.neutral[700]}>
                                {
                                    colorFormat === "RGB"
                                        ? `rgb(${Math.floor(value.r * 255)}, ${Math.floor(value.g * 255)}, ${Math.floor(value.b * 255)})`
                                        : "#" + convertRgbColorToHexColor(value)?.toString()
                                }
                            </Text>
                        </Flex>
                    }
                }
            case "number":
            case "string":
                return <Text fontSize={11} fill={colors.neutral[700]}>{value}</Text>
            case "boolean":
                return <Text fontSize={11} fill={colors.indigo[700]} fontFamily={'Fira Code'}>{String(value)}</Text>
            case "undefined":
                return <Text fontSize={11} fill={colors.neutral[400]}>Empty</Text>
            default:
                return null
        }
    }

    const header = (
        <Flex {...styles.entry} spacing={4} padding={{ horizontal: 16 }} cornerRadius={{ topLeft: 8, topRight: 8 }} height={32} minHeight={32}>
            <Text fontSize={11} verticalAlignText='center' fontWeight={'medium'} fill={colors.neutral[500]} width={'hug-contents'}>
                {varialeCollection?.name}
                <Span fill={colors.neutral[400]}>{` ${"·"} `}</Span>
                <Span fill={colors.neutral[700]} fontWeight={"medium"}>{change?.name?.[0]}</Span>
            </Text>
            <ChangeTypeTag type={change.type} />
        </Flex>
    )

    return (
        <Flex width={'fill-parent'} height={'fill-parent'} fill={colors.white} cornerRadius={8} direction='vertical' spacing={16} overflow='visible'>
            {showHeader ? header : null}

            <Flex direction='vertical' width={'fill-parent'} overflow='visible' spacing={1}>
                <Label>Name</Label>
                <Entry oldValue={change.name?.[0]} newValue={change.name?.[1]} />
            </Flex>

            {
                (change.codeSyntax && (Object.values(change.codeSyntax).filter(value => value.length > 1).length > 0) || (change.type === ChangeType.ADD && Object.keys(change.codeSyntax).length > 0)) ?
                    <Flex direction='vertical' width={'fill-parent'} overflow='visible' spacing={1}>
                        <Label>Code Syntax</Label>
                        {change.codeSyntax.WEB ? <Entry oldValue={change.codeSyntax?.WEB?.[1]} newValue={change.codeSyntax?.WEB?.[0]} name='Web' /> : null}
                        {change.codeSyntax.iOS ? <Entry oldValue={change.codeSyntax?.iOS?.[1]} newValue={change.codeSyntax?.iOS?.[0]} name='iOS' /> : null}
                        {change.codeSyntax.ANDROID ? <Entry oldValue={change.codeSyntax?.ANDROID?.[1]} newValue={change.codeSyntax?.ANDROID?.[0]} name='Android' /> : null}
                    </Flex>
                    : null
            }

            <Flex direction='vertical' width={'fill-parent'} overflow='visible'>
                <Label>Description</Label>
                <Entry fallback='No description' oldValue={change.description?.[1]} newValue={change.description?.[0]} />
            </Flex>


            {(change.valuesByMode && (Object.values(change.valuesByMode).filter(value => value.length > 1).length > 0) || change.type === ChangeType.ADD) ?
                <Flex direction='vertical' width={'fill-parent'} overflow='visible'>
                    <Flex width={'fill-parent'} verticalAlignItems='center' padding={{ right: 16 }} overflow='visible'>
                        <Label>Modes</Label>
                        {
                            change.resolvedType === 'COLOR'
                                ? <Menu id='colorFormat' placement='top-end'>
                                    <MenuTrigger fontSize={11} verticalAlignItems='center' color={colors.neutral[500]}>
                                        {colorFormat}
                                        <IconChevronDownSolid width={10} height={10} />
                                    </MenuTrigger>
                                    <MenuList maxWidth={120} width={120}>
                                        <MenuItem height={24} fontSize={11} onClick={() => setColorFormat('HEX')}>HEX</MenuItem>
                                        <MenuItem height={24} fontSize={11} onClick={() => setColorFormat('RGB')}>RGB</MenuItem>
                                        <MenuItem height={24} fontSize={11} onClick={() => setColorFormat('HSV')}>HSV</MenuItem>
                                    </MenuList>
                                </Menu> :
                                null
                        }
                    </Flex>



                    <Flex direction='vertical' width={'fill-parent'} spacing={1} overflow='visible'>
                        {
                            change.valuesByMode ? Object.entries(change.valuesByMode)
                                .filter(([, value]) => change.type === ChangeType.ADD ? value : value.length > 1)
                                .map(([modeId, value]) => {
                                    return <Entry
                                        name={varialeCollection?.modes.find(mode => mode.modeId === modeId)?.name}
                                        key={modeId}
                                        oldValue={renderValue(value[0])}
                                        newValue={value[1] && renderValue(value[1])}
                                    />
                                }) : null
                        }
                    </Flex>
                </Flex> : null
            }
        </Flex>
    )
}