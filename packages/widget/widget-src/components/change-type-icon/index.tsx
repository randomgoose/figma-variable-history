import { ChangeType } from "../../types";
import { colors } from 'fidget-ui'
import { IconMinus, IconPlus } from 'fidget-ui/icons'

const { Text } = figma.widget

export function ChangeTypeIcon({ type }: { type: ChangeType }) {
    switch (type) {
        case ChangeType.ADD:
            return <IconPlus width={8} height={8} color={colors.emerald[700]} />
        case ChangeType.DELETE:
            return <IconMinus width={8} height={8} color={colors.red[700]} />
        default:
            return <Text fontSize={11} fill={colors.yellow[700]}>M</Text>
    }
}