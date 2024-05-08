import { IconMagnifyingGlassSolid, IconMinusSolid } from "fidget-ui/icons";
import { ICommit } from "../../types";
import { colors, Avatar, IconButton, TextField, AvatarGroup, } from 'fidget-ui'
import { Pagination } from "../pagination";
import { PREFIX } from "../../constants";

const { AutoLayout: Flex, Text, useSyncedState } = figma.widget

const PAGE_SIZE = 12;

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
        fontSize: 12,
        fill: colors.neutral[900],
        fontWeight: 'medium'
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

export function Commits({ commits, currentCommit, setCurrentCommit, onClickCommit }: CommitsProps) {
    const [currentPage, setCurrentPage] = useSyncedState(`${PREFIX}__commits_current_page`, 0)
    const [keyword, setKeyword] = useSyncedState(`${PREFIX}__commits_keyword`, '')
    const [, setCurrentDetailPage] = useSyncedState(`${PREFIX}__commit_detail_current_page`, 0)

    const pages = Math.round(Object.entries(commits).length / PAGE_SIZE)

    async function getCommitById(id: string) {
        return figma.root.getPluginData(id);
    }

    return <Flex direction="vertical" padding={{ top: 2 }} width={'fill-parent'}>
        <TextField width={'fill-parent'} id={`commits_history`} fontSize={11} variant="flush" value={keyword} onTextEditEnd={e => setKeyword(e.characters)} placeholder="Search" elementLeft={<IconMagnifyingGlassSolid width={12} height={12} color={colors.neutral[400]} />} />
        {commits
            .sort((a, b) => b.date - a.date)
            .filter(({ summary, description }) => summary.includes(keyword) || description?.includes(keyword))
            .map(({ id, collaborators, date, summary }) => (
                <Flex
                    name="commit"
                    {...styles.container}
                    key={id}
                    fill={currentCommit?.id === id ? colors.neutral[900] : colors.white}
                    hoverStyle={{ fill: currentCommit?.id === id ? colors.neutral[800] : colors.neutral[100] }}
                    onClick={async () => {
                        const commit = await getCommitById(id)

                        if (commit) {
                            setCurrentCommit(JSON.parse(commit))
                            figma.closePlugin()
                        }

                        setCurrentDetailPage(0)

                        onClickCommit && onClickCommit(JSON.parse(commit))
                    }}>

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

        {
            pages > 1
                ? <Pagination
                    onIncrease={() => setCurrentPage(prev => prev + 1 <= Math.round(Object.entries(commits).length / PAGE_SIZE) ? prev + 1 : prev)}
                    onDecrease={() => setCurrentPage(prev => prev - 1 >= 0 ? prev - 1 : prev)}
                    currentPage={currentPage}
                    pages={pages}
                />
                : null
        }
    </Flex>
}