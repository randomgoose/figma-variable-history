import { ICommit } from "../../types";
import { colors, Avatar, AvatarGroup, } from 'fidget-ui'

const { AutoLayout: Flex, Text } = figma.widget

interface CommitsProps {
    commits: ICommit[];
    currentCommit?: ICommit | null;
    setCurrentCommit: (commit: ICommit) => void;
    onClickCommit?: (commit: ICommit) => void;
}

const styles: {
    container: AutoLayoutProps;
    summary: TextProps;
} = {
    container: {
        width: 'fill-parent',
        minHeight: 48,
        hoverStyle: { fill: colors.neutral[100] },
        padding: { horizontal: 12 },
        verticalAlignItems: 'center',
        direction: 'vertical',
        minWidth: 240,
        spacing: 4,
        stroke: colors.neutral[100],
        strokeAlign: 'outside'
    },
    summary: {
        fontSize: 16,
        fill: colors.neutral[900],
        fontWeight: 'semi-bold',
    },

}

function parsedDate(date: number) {
    const now = new Date();
    const d = new Date(date);
    const delta = now.getTime() - d.getTime();

    if (delta < 3600000) {
        return Math.floor(delta / 60000) + ' minutes ago';
    }
    else if (delta < 86400000) {
        return Math.floor(delta / 3600000) + ' hours ago';
    } if (delta < 3 * 86400000) {
        return Math.floor(delta / 3600000 / 24) + ' days ago';
    } else {
        return (new Date(date).toLocaleDateString()).toString()
    }
}

export function Commits({ commits, currentCommit, onClickCommit }: CommitsProps) {

    return <Flex direction="vertical" padding={{ top: 2 }} width={'fill-parent'}>
        {commits
            .sort((a, b) => b.date - a.date)
            .map(({ id, collaborators, date, summary }) => (
                <Flex
                    name="commit"
                    {...styles.container}
                    key={id}
                    fill={currentCommit?.id === id ? colors.neutral[900] : colors.white}
                    hoverStyle={{ fill: currentCommit?.id === id ? colors.neutral[800] : colors.neutral[100] }}
                >

                    <Text
                        {...styles.summary}
                        fill={currentCommit?.id === id ? colors.white : colors.neutral[900]}
                    >
                        {summary}
                    </Text>

                    <Flex verticalAlignItems='center' spacing={4} width={'fill-parent'}>
                        {collaborators ? <AvatarGroup size={16}>
                            {...collaborators?.map(user => <Avatar key={user?.id || ''} src={user?.photoUrl || ''} />)}
                        </AvatarGroup> : null}
                        {collaborators?.length === 1 ? <Text fontSize={11} width={'fill-parent'} fill={colors.neutral[500]}>{collaborators[0]?.name}</Text> : null}
                        <Text fontSize={11} fill={currentCommit?.id === id ? colors.neutral[400] : colors.neutral[500]}>
                            {parsedDate(date)}
                        </Text>
                    </Flex>
                </Flex>
            ))}

    </Flex>
}