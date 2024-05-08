import { IconButton } from "fidget-ui"
import { IconChevronLeftSolid, IconChevronRightSolid } from "fidget-ui/icons"

const { AutoLayout: Flex, Text } = figma.widget

export function Pagination({ currentPage, pages, onDecrease, onIncrease }: {
    currentPage: number;
    pages: number;
    onIncrease: () => void;
    onDecrease: () => void;
}) {
    return (
        <Flex width={'fill-parent'} horizontalAlignItems={'end'} verticalAlignItems="center">
            <IconButton size="sm" variant="ghost" icon={<IconChevronLeftSolid width={10} height={10} />} onClick={onDecrease} width={24} height={24} cornerRadius={4} />
            <Flex verticalAlignItems="center">
                <Text width={16} fontSize={11} horizontalAlignText="center">{currentPage}</Text>
                <Text fontSize={11} horizontalAlignText="center">/</Text>
                <Text width={16} fontSize={11} horizontalAlignText="center">{pages}</Text>
            </Flex>
            <IconButton size="sm" variant="ghost" icon={<IconChevronRightSolid />} onClick={onIncrease} width={24} height={24} cornerRadius={4} />
        </Flex>
    )
}