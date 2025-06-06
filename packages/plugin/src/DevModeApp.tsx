import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from './AppContext';
import ReactDiffViewer from 'react-diff-viewer';
import { Select, Tabs } from 'radix-ui';
import { IconChevronDown, IconChevronUp, IconGitCompare, IconLoader } from '@tabler/icons-react';
import { MESSAGE_TYPE, sendMessage } from './utils/message';
import { parseDate } from './utils/date';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import { ICommit } from './types';
import clsx from 'clsx';
import { getVariableChangesGroupedByCollection } from './utils/variable';
import { useCommitBridge } from './hooks/useCommitBridge';
import { download } from './utils/download';
import { GroupedChanges } from './ui/components/GroupedChanges';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { VariableDetail } from './ui/components/VariableDetail';
import { EmptyState } from './ui/components';

const views = [
  { key: 'variable', label: 'Figma variables' },
  { key: 'css', label: 'CSS' },
  // { key: 'ios', label: 'iOS' },
  // { key: 'android', label: 'Android' },
];

interface ICommitSelectProps {
  commits: ICommit[];
  value: string;
  onChange: (value: string) => void;
  showCurrent?: boolean;
  disabledAfter?: number;
  isLoading?: boolean;
}

function CommitSelect({
  commits,
  value,
  onChange,
  disabledAfter,
  showCurrent,
  isLoading,
}: ICommitSelectProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={(value) => {
        onChange(value);
        if (value !== 'current' && value !== '') {
          sendMessage(MESSAGE_TYPE.EXPORT_CODE, {
            commit: commits.find((commit) => commit.id === value),
          });
        }
      }}
    >
      <Select.Trigger className="input flex items-center gap-2 overflow-hidden w-full">
        <Select.Value placeholder="Select a commit" asChild>
          <span className="truncate max-w-full">
            {value === 'current'
              ? 'Current'
              : commits.find((commit) => commit.id === value)?.summary}
          </span>
        </Select.Value>
        <Select.Icon asChild>
          <IconChevronDown className="ml-auto shrink-0" size={12} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" className="dropdown-content max-h-64 z-50">
          <Select.ScrollUpButton className="flex items-center justify-center">
            <IconChevronUp size={12} className="text-[var(--figma-color-text-oninverse)]" />
          </Select.ScrollUpButton>
          <Select.Viewport className="w-full">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <IconLoader className="animate-spin text-white w-4 h-4" />
              </div>
            ) : commits.length > 0 ? (
              <>
                {showCurrent ? (
                  <Select.Item value={'current'} className="w-full dropdown-item text-white gap-1">
                    <Select.ItemText>Current</Select.ItemText>
                  </Select.Item>
                ) : null}
                {commits.map((commit) => {
                  const disabled =
                    commit.date && disabledAfter && commit.date >= disabledAfter ? true : false;
                  return (
                    <Select.Item
                      disabled={disabled}
                      key={commit.id}
                      className={clsx('w-full dropdown-item text-white gap-1', {
                        'opacity-50 cursor-not-allowed hover:bg-transparent': disabled,
                      })}
                      value={commit.id}
                    >
                      <Select.ItemText asChild>
                        <span className="truncate max-w-full">{commit.summary}</span>
                      </Select.ItemText>
                      {commit?.date && (
                        <span className="text-xs text-[var(--figma-color-text-oninverse)] opacity-50 ml-auto text-nowrap">
                          {parseDate(commit.date, { showTime: false })}
                        </span>
                      )}
                    </Select.Item>
                  );
                })}
              </>
            ) : (
              <div className="text-white/50 flex items-center justify-center">No commit</div>
            )}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center">
            <IconChevronDown size={12} className="text-[var(--figma-color-text-oninverse)]" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function DevModeApp() {
  const { fileUUID, exportCode, variables, collections } = useContext(AppContext);
  const { commits, isLoading } = useCommitBridge(fileUUID);
  const [currentCommitId, setCurrentCommitId] = useState<string>('current');
  const [prevCommitId, setPrevCommitId] = useState<string>('');
  const [selectedVariableId, setSelectedVariableId] = useState<string>('');
  const [initialized, setInitialized] = useState<boolean>(false);
  const [view, setView] = useState<string>('variable');

  useEffect(() => {
    const currentCommit = commits.find((commit) => commit.id === currentCommitId);
    const prevCommit = commits.find((commit) => commit.id === prevCommitId);

    if (
      currentCommit &&
      prevCommit &&
      currentCommit.date &&
      prevCommit.date &&
      currentCommit.date <= prevCommit.date
    ) {
      setPrevCommitId('');
    }
  }, [currentCommitId]);

  useEffect(() => {
    if (commits.length > 0 && !initialized) {
      sendMessage(MESSAGE_TYPE.EXPORT_CODE, { commit: commits[0] });
      setPrevCommitId(commits[0].id);
      setInitialized(true);
    }
  }, [commits.length]);

  const newValue = useMemo(() => {
    try {
      return exportCode[currentCommitId]?.WEB?.['variables.css'] || '';
    } catch (error) {
      return '';
    }
  }, [exportCode, commits]);

  const oldValue = useMemo(() => {
    try {
      return exportCode[prevCommitId]?.WEB?.['variables.css'] || '';
    } catch (error) {
      return '';
    }
  }, [exportCode, commits]);

  const groupedChanges = useMemo(() => {
    const prevCommit = commits.find((c) => c.id === prevCommitId);
    const currentCommit =
      currentCommitId === 'current'
        ? { variables, collections }
        : commits.find((c) => c.id === currentCommitId);

    if (!prevCommit || !currentCommit) {
      return {};
    }

    return getVariableChangesGroupedByCollection({
      current: {
        variables: currentCommit?.variables,
        collections: currentCommit?.collections,
      },
      prev: {
        variables: prevCommit?.variables || [],
        collections: prevCommit?.collections || [],
      },
    });
  }, [commits, currentCommitId, prevCommitId]);

  const renderView = useCallback(() => {
    switch (view) {
      case 'variable':
        const numOfChanges = Object.values(groupedChanges).reduce(
          (acc, { added, modified, removed }) =>
            acc + added.length + modified.length + removed.length,
          0
        );
        const hasUncommittedChanges = numOfChanges > 0;

        return numOfChanges > 0 ? (
          <PanelGroup direction="vertical" className="h-full w-full">
            <Panel className="p-2 pr-0 bg-[var(--figma-color-bg-secondary)]" defaultSize={50}>
              <GroupedChanges
                groupedChanges={groupedChanges}
                onClickVariableItem={(id) => {
                  setSelectedVariableId(id);
                }}
                disableInteraction
              />
            </Panel>

            <PanelResizeHandle />
            {selectedVariableId && (
              <Panel className="border-y border-neutral-200">
                <VariableDetail
                  current={
                    currentCommitId === 'current'
                      ? variables.find((v) => v.id === selectedVariableId)
                      : commits
                          .find((c) => c.id === currentCommitId)
                          ?.variables.find((v) => v.id === selectedVariableId)
                  }
                  currentCollection={
                    currentCommitId === 'current'
                      ? collections.find((c) => c.id === selectedVariableId)
                      : commits
                          ?.find((c) => c.id === currentCommitId)
                          ?.collections.find(
                            (c) =>
                              c.id ===
                              commits
                                .find((c) => c.id === currentCommitId)
                                ?.variables.find((v) => v.id === selectedVariableId)
                                ?.variableCollectionId
                          )
                  }
                  prev={commits[commits.findIndex((c) => c.id === prevCommitId)]?.variables.find(
                    (v) => v.id === selectedVariableId
                  )}
                  prevCollection={commits[
                    commits.findIndex((c) => c.id === prevCommitId)
                  ]?.collections.find(
                    (c) =>
                      c.id ===
                      commits
                        .find((c) => c.id === prevCommitId)
                        ?.variables.find((v) => v.id === selectedVariableId)?.variableCollectionId
                  )}
                />
              </Panel>
            )}
          </PanelGroup>
        ) : (
          <EmptyState />
        );
      case 'css':
        return (
          <Tabs.Root
            defaultValue="variables.css"
            className="h-full flex flex-col overflow-hidden border-b border-neutral-200"
          >
            <Tabs.List className="tabs-list top-12 bg-[var(--figma-color-bg)] z-10 border-b border-neutral-200">
              <Tabs.Trigger className="tabs-trigger lowercase" value="variables.css">
                variables.css
              </Tabs.Trigger>
            </Tabs.List>
            <div className="h-full overflow-auto">
              <Tabs.Content value="variables.css">
                {oldValue && newValue && (
                  <ReactDiffViewer
                    styles={{
                      contentText: {
                        fontSize: 11,
                      },
                      diffRemoved: {
                        textDecoration: 'line-through',
                      },
                    }}
                    oldValue={oldValue}
                    newValue={newValue}
                    splitView={false}
                    renderContent={(str) => {
                      return (
                        <pre
                          style={{ display: 'inline' }}
                          dangerouslySetInnerHTML={{
                            __html: Prism.highlight(str, Prism.languages.css, 'css'),
                          }}
                        />
                      );
                    }}
                  />
                )}
              </Tabs.Content>
            </div>
          </Tabs.Root>
        );
      default:
        return null;
    }
  }, [view, groupedChanges, currentCommitId, prevCommitId, commits]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex h-12 items-center gap-2 p-3 border-b border-neutral-200 sticky top-0 bg-[var(--figma-color-bg)] z-20">
        <CommitSelect
          commits={commits}
          value={currentCommitId}
          onChange={(value) => {
            setCurrentCommitId(value);
          }}
          showCurrent
          isLoading={isLoading}
        />
        <IconGitCompare size={16} className="text-[var(--figma-color-text-secondary)] shrink-0" />
        <CommitSelect
          commits={commits}
          value={prevCommitId}
          onChange={(value) => {
            setPrevCommitId(value);
          }}
          disabledAfter={commits.find((commit) => commit.id === currentCommitId)?.date}
          isLoading={isLoading}
        />

        <Select.Root
          value={view}
          onValueChange={(value) => {
            setView(value);
          }}
        >
          <Select.Trigger className="input flex items-center ml-8 text-nowrap">
            <Select.Value />
            <Select.Icon asChild>
              <IconChevronDown className="ml-1 shrink-0" size={12} />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content position="popper" className="dropdown-content w-32 z-50">
              <Select.ScrollUpButton className="flex items-center justify-center">
                <IconChevronUp size={12} className="text-[var(--figma-color-text-oninverse)]" />
              </Select.ScrollUpButton>
              <Select.Viewport className="w-full">
                {views.map((view) => {
                  return (
                    <Select.Item
                      key={view.key}
                      value={view.key}
                      className="dropdown-item text-white"
                    >
                      <Select.ItemText>{view.label}</Select.ItemText>
                    </Select.Item>
                  );
                })}
              </Select.Viewport>
              <Select.ScrollDownButton className="flex items-center justify-center">
                <IconChevronDown size={12} className="text-[var(--figma-color-text-oninverse)]" />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {renderView()}

      <div className="flex items-center gap-2 p-3">
        <button
          className="btn-primary bg-blue-500"
          onClick={() => {
            download(exportCode[currentCommitId].WEB?.['variables.css'], 'css', 'variables.css');
          }}
        >
          Export code
        </button>
      </div>
    </div>
  );
}
