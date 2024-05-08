import { Tag } from "fidget-ui"
import { ChangeType } from "../../types"

export function ChangeTypeTag({ type }: { type: ChangeType }) {
    switch (type) {
        case ChangeType.ADD:
            return <Tag colorScheme="emerald" variant="subtle" size="sm">New</Tag>
        case ChangeType.MODIFY:
            return <Tag colorScheme="orange" variant="subtle" size="sm">Modified</Tag>
        case ChangeType.DELETE:
            return <Tag colorScheme="red" variant="subtle" size="sm">Removed</Tag>
    }
}