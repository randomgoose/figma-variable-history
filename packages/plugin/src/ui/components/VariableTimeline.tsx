import { ReactNode, useContext, useMemo, useState } from 'react';
import { AppContext } from '../../AppContext';
import { diffVariables } from '../../utils/variable';
import { ParsedValue } from './ParsedValue';
import {
  IconArrowRight,
  IconCheck,
  IconCirclePlus,
  IconCode,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconForms,
  IconHash,
  IconMessage2Off,
  IconMessage2Plus,
} from '@tabler/icons-react';
import clsx from 'clsx';
import styles from '../styles.module.css';
import { CopyTextWrapper } from './CopyWrapper';
import { ICommit } from '../../types';
import * as Dropdown from '@radix-ui/react-dropdown-menu';

const diffKeys = [
  'name',
  'description',
  'valuesByMode',
  'codeSyntax',
  'scopes',
  'hiddenFromPublishing',
];
const diffKeyLabelMap: Record<string, string> = {
  name: 'Name',
  description: 'Description',
  valuesByMode: 'Value',
  hiddenFromPublishing: 'Visibility',
  codeSyntax: 'Code syntax',
  scopes: 'Scopes',
};
const diffKeyIconMap: Record<string, ReactNode> = {
  name: <IconForms size={14} />,
  description: <IconMessage2Plus size={14} />,
  valuesByMode: <IconHash size={14} />,
  hiddenFromPublishing: <IconEye size={14} />,
  codeSyntax: <IconCode size={14} />,
  scopes: <IconEdit size={14} />,
};

function DiffItem({
  icon,
  children,
  className,
  commitId,
}: {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  commitId?: string;
}) {
  const { setSelectedCommitId, setTab } = useContext(AppContext);

  return (
    <div className={clsx(styles.commitItem, 'group max-h-12', className)}>
      <div className={clsx(styles.commitItem__icon, 'shrink-0')} />
      <div className={clsx(styles.commitItem__content, 'flex items-center gap-2 grow')}>
        {icon ? <div style={{ color: 'var(--figma-color-text-secondary)' }}>{icon}</div> : null}
        <div className="flex item-center grow">{children}</div>
      </div>

      <button
        className=" shadow-sm border absolute opacity-0 group-hover:opacity-100 right-0 group-hover:right-3 top-1/2 -translate-y-1/2 bg-white border-gray-200 w-7 h-7 rounded-md flex items-center justify-center transition-all"
        onClick={() => {
          setTab('commits');
          commitId && setSelectedCommitId(commitId);
        }}
      >
        <IconArrowRight size={14} style={{ color: 'var(--figma-color-text-secondary)' }} />
      </button>
    </div>
  );
}

export function VariableTimeline({ variableId }: { variableId: string }) {
  const { commits } = useContext(AppContext);
  const [selectedDiffKeys, setSelectedDiffKeys] = useState(diffKeys);

  const commitsIncludingVariable = useMemo(() => {
    return commits.filter((c) => c.variables.find((v) => v.id === variableId));
  }, [commits, variableId]);

  const foldedCommits = useMemo(() => {
    const result = [];
    let currentGroup: ICommit[] = [];

    for (let i = 0; i < commitsIncludingVariable.length; i++) {
      const currentCommit = commitsIncludingVariable[i];
      const prevCommit = commitsIncludingVariable[i + 1];
      const currentVariable = currentCommit.variables.find((v) => v.id === variableId);
      const prevVariable = prevCommit?.variables.find((v) => v.id === variableId);

      if (currentVariable) {
        if (!prevVariable) {
          if (i === commitsIncludingVariable.length - 1) {
            result.push(currentGroup);
          }
          result.push(currentCommit);
        } else {
          const changedProperties = Object.keys(
            diffVariables({ variable: prevVariable }, { variable: currentVariable })
          );

          if (changedProperties.length > 0) {
            currentGroup.length > 0 && result.push(currentGroup);
            currentGroup = [];
            result.push(currentCommit);
          } else {
            currentGroup.push(currentCommit);
          }
        }
      } else {
        result.push(currentCommit);
      }
    }

    return result;
  }, [commitsIncludingVariable, selectedDiffKeys]);

  return (
    <>
      <div className="flex px-3 py-3 items-center justify-between">
        <h5 className="font-semibold">History</h5>
        <Dropdown.Root>
          <Dropdown.Trigger className="h-7 px-3 border rounded-md">Filter</Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content className="dropdown-content" align="end" sideOffset={4}>
              {diffKeys.map((key) => (
                <Dropdown.CheckboxItem
                  className="dropdown-item pl-8 relative flex items-center"
                  key={key}
                  onSelect={(e) => e.preventDefault()}
                  checked={selectedDiffKeys.includes(key)}
                  onCheckedChange={() => {
                    if (selectedDiffKeys.includes(key)) {
                      setSelectedDiffKeys(selectedDiffKeys.filter((k) => k !== key));
                    } else {
                      setSelectedDiffKeys([...selectedDiffKeys, key]);
                    }
                  }}
                >
                  <Dropdown.ItemIndicator className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center mr-1">
                    <IconCheck size={12} />
                  </Dropdown.ItemIndicator>
                  {diffKeyIconMap[key]}
                  <div className="ml-2">{diffKeyLabelMap[key]}</div>
                </Dropdown.CheckboxItem>
              ))}
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      </div>

      {foldedCommits.map((item) => {
        if (Array.isArray(item)) {
          // return <div className={clsx(styles.commitItem)}>
          //     <div className={styles.commitItem__icon}></div>
          //     <div style={{ color: 'var(--figma-color-text-secondary)' }} className={clsx(styles.commitItem__content, 'cursor-pointer')}>
          //         <div>{item.length} {item.length >= 1 ? 'commits are' : 'commit is'} hidden.</div>
          //     </div>
          // </div>
          return null;
        } else {
          const index = commitsIncludingVariable.findIndex((c) => c.id === item.id);
          const current = item.variables.find((v) => v.id === variableId);
          const prevCommit =
            index + 1 < commitsIncludingVariable.length
              ? commitsIncludingVariable[index + 1]
              : null;
          const prev = prevCommit?.variables.find((v) => v.id === variableId);

          return (
            <CommitItem
              selectedDiffKeys={selectedDiffKeys}
              key={item.id}
              commit={item}
              prev={prev}
              current={current}
            />
          );
        }
      })}
    </>
  );
  {
    /* <DiffItem /> */
  }
}

function CommitItem({
  commit,
  prev,
  current,
  selectedDiffKeys,
}: {
  commit: ICommit;
  prev: Variable | undefined;
  current: Variable | undefined;
  selectedDiffKeys: string[];
  className?: string;
}) {
  const { collections } = useContext(AppContext);

  const renderDiff = (current: Variable, prev: Variable) => {
    const prevCollection = collections.find((c) => c.id === prev.variableCollectionId);
    const currentCollection = collections.find((c) => c.id === current.variableCollectionId);
    const diff = diffVariables(
      { variable: prev, collection: prevCollection },
      { variable: current, collection: currentCollection }
    );

    return Object.entries(diff)
      .filter(([key]) => selectedDiffKeys.includes(key))
      .sort(([key1], [key2]) => diffKeys.indexOf(key1) - diffKeys.indexOf(key2))
      .map(([key, value]) => {
        switch (key) {
          case 'name':
            return (
              <DiffItem commitId={commit.id} icon={<IconForms size={14} />} key={key}>
                <div>
                  Renamed <span className="font-semibold">"{value[0]}"</span> to{' '}
                  <span className="font-semibold">"{value[1]}"</span>
                </div>
              </DiffItem>
            );
          case 'description':
            if (!value[0]) {
              return (
                <DiffItem key={key} commitId={commit.id} icon={<IconMessage2Plus size={14} />}>
                  <div>
                    Added description <span className="font-semibold">"{value[1]}"</span>
                  </div>
                </DiffItem>
              );
            } else if (!value[1]) {
              return (
                <DiffItem key={key} commitId={commit.id} icon={<IconMessage2Off size={14} />}>
                  <div key={key}>Removed description</div>
                </DiffItem>
              );
            } else {
              return <div key={key}></div>;
            }
          case 'valuesByMode':
            return Object.entries(value).map(([modeId]) => {
              const mode =
                currentCollection?.modes.find((m) => m.modeId === modeId) ||
                prevCollection?.modes.find((m) => m.modeId === modeId);
              return (
                <DiffItem key={key} commitId={commit.id} icon={<IconHash size={14} />}>
                  <div className="variableDetail-item w-full">
                    <div className="flex self-center">{mode?.name || 'Removed mode'}</div>
                    <div>
                      <ParsedValue variable={prev} modeId={modeId} />
                    </div>
                    <div className={'variableDetail-itemArrow'}>
                      <IconArrowRight
                        size={14}
                        style={{ color: 'var(--figma-color-icon-tertiary)' }}
                      />
                    </div>
                    <div>
                      <ParsedValue variable={current} modeId={modeId} />
                    </div>
                  </div>
                </DiffItem>
              );
            });
          case 'hiddenFromPublishing':
            if (value[0] && !value[1]) {
              return (
                <DiffItem key={key} commitId={commit.id} icon={<IconEye size={14} />}>
                  Shown in publishing
                </DiffItem>
              );
            } else if (!value[0] && value[1]) {
              return (
                <DiffItem key={key} commitId={commit.id} icon={<IconEyeOff size={14} />}>
                  Hidden from publishing
                </DiffItem>
              );
            } else {
              return <div></div>;
            }
          case 'codeSyntax':
            const codeSyntaxKey = ['WEB', 'ANDROID', 'IOS'];

            return (
              <div key={key}>
                {codeSyntaxKey.map((key) => {
                  if (value[0]?.[key] || value[1]?.[key]) {
                    return (
                      <DiffItem key={key} commitId={commit.id} icon={<IconCode size={14} />}>
                        <div className="variableDetail-item w-full">
                          <div>{key}</div>
                          <CopyTextWrapper text={value[0]?.[key] || 'Not defined'}>
                            {value[0]?.[key] || 'Not defined'}
                          </CopyTextWrapper>
                          <div className={'variableDetail-itemArrow'}>
                            <IconArrowRight
                              size={14}
                              style={{ color: 'var(--figma-color-icon-tertiary)' }}
                            />
                          </div>
                          <CopyTextWrapper text={value[1]?.[key] || 'Not defined'}>
                            {value[1]?.[key] || 'Not defined'}
                          </CopyTextWrapper>
                        </div>
                      </DiffItem>
                    );
                  }
                })}
              </div>
            );
          case 'scopes':
            return (
              <DiffItem key={key} commitId={commit.id} icon={<IconEdit size={14} />}>
                <div>
                  Changed scopes from{' '}
                  <span className="font-semibold">
                    {value[0].map((s) => s.toLowerCase().replaceAll('_', ' ')).join(', ')}{' '}
                  </span>
                  to{' '}
                  <span className="font-semibold">
                    {value[1].map((s) => s.toLowerCase().replaceAll('_', ' ')).join(', ')}
                  </span>
                </div>
              </DiffItem>
            );
          default:
            return <div>Null</div>;
        }
      });
  };

  return current && prev ? (
    renderDiff(current, prev)
  ) : (
    <DiffItem icon={<IconCirclePlus size={14} />} commitId={commit.id}>
      <div>
        Created <span className="font-semibold">{current?.name}</span>
      </div>
    </DiffItem>
  );
}
