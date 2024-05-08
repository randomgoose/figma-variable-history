import { ChangeType, IChange, ICommit } from "../../types";
import { colors } from 'fidget-ui'
import { ChangeTypeIcon } from "../change-type-icon";
import { Pagination } from "../pagination";
import { PREFIX } from "../../constants";
import _ from 'lodash'
import { icon_boolean, icon_boolean_inverse, icon_color, icon_color_inverse, icon_number, icon_number_inverse, icon_text, icon_text_inverse } from "../../icons";

const { useSyncedState, AutoLayout: Flex, Text, SVG } = figma.widget

const icon_map = {
    COLOR: [icon_color, icon_color_inverse],
    STRING: [icon_text, icon_text_inverse],
    BOOLEAN: [icon_boolean, icon_boolean_inverse],
    FLOAT: [icon_number, icon_number_inverse]
}

interface ChangesProps {
    id: string;
    changes: { [key: string]: IChange };
    lastCommit?: ICommit; currentChange?: IChange | null;
    setCurrentChange: (change: IChange) => void;
    pageSize?: number;
    page: number;
    setPage: (newValue: number | ((currValue: number) => number)) => void
}

export function Changes({ changes, lastCommit, currentChange, setCurrentChange, pageSize = 11, page, setPage }: ChangesProps) {

    const pages = Math.round(Object.entries(changes).length / pageSize)

    return (
        <Flex width={'fill-parent'} height={'fill-parent'} direction="vertical" stroke={colors.neutral[200]} strokeAlign="outside">
            <Flex height={24} padding={{ left: 8, }} verticalAlignItems="center" width={'fill-parent'}>
                <Flex spacing={8} verticalAlignItems="center">
                    {Object.entries(_.groupBy(changes, 'type')).map(([k, v]) => v.length > 0 ?
                        <Flex key={k} verticalAlignItems="center" spacing={2}>
                            <ChangeTypeIcon type={k as ChangeType} />
                            <Text fontSize={10} key={k} fill={k === ChangeType.ADD ? colors.emerald[700] : k === ChangeType.MODIFY ? colors.yellow[700] : colors.red[700]}>{v.length}</Text>
                        </Flex>
                        : null
                    )}
                </Flex>
            </Flex>
            <Flex height={'fill-parent'} direction="vertical" width={'fill-parent'}>
                {
                    Object.entries(changes).length > 0
                        ? Object
                            .entries(changes)
                            .slice(page * pageSize, (page + 1) * pageSize)
                            .map(([id, change]) => {
                                const isCurrentChange = id === currentChange?.id?.[0]
                                return <Flex
                                    width={'fill-parent'}
                                    fill={isCurrentChange ? colors.neutral[900] : undefined}
                                    hoverStyle={{ fill: isCurrentChange ? colors.neutral[800] : colors.neutral[100] }}
                                    key={id}
                                    height={32}
                                    padding={8}
                                    verticalAlignItems="center"
                                    onClick={() => setCurrentChange(change as IChange)}
                                    stroke={colors.neutral[100]}
                                    strokeAlign="center"
                                    spacing={4}
                                >
                                    <SVG src={icon_map[change.resolvedType][isCurrentChange ? 1 : 0]} width={12} height={12} />
                                    <Text
                                        fill={isCurrentChange ? colors.white : colors.neutral[700]} fontSize={11} width={'fill-parent'}
                                        textDecoration={change.type === ChangeType.DELETE ? 'strikethrough' : 'none'}
                                    >
                                        {change.name?.[0]}
                                    </Text>
                                    <ChangeTypeIcon type={change.type} />
                                </Flex>
                            })
                        : <Flex width={'fill-parent'} height={'fill-parent'} verticalAlignItems="center" horizontalAlignItems={'center'}>
                            <Text fontSize={11} fill={colors.neutral[500]}>It's time to make some changes.</Text>
                        </Flex>
                }
            </Flex>

            {
                pages > 1
                    ? <Pagination
                        onIncrease={() => setPage(prev => prev + 1 <= Math.floor(Object.entries(changes).length / pageSize) ? prev + 1 : prev)}
                        onDecrease={() => setPage(prev => prev - 1 >= 0 ? prev - 1 : prev)}
                        currentPage={page + 1}
                        pages={pages}
                    />
                    : null
            }
        </Flex>
    )
}