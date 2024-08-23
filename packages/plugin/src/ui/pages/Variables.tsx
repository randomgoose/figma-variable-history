import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../AppContext';
import { groupBy } from 'lodash-es';
import { Content, Header, Item, Root, Trigger } from '@radix-ui/react-accordion';
import { ChevronRight, CornerDownLeft, History } from 'lucide-react';
import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { VariableItem } from '../components/VariableItem';
import clsx from 'clsx';
import { VariableNode } from '../components/nodes/VariableNode';
import { Search } from '../components/Search';
import { VariableTimeline } from '../components/VariableTimeline';
import { VariableIcon } from '../components/VariableIcon';
import { NoCommitPlaceholder } from '../components/NoCommitPlaceholder';

const viewOptions = [
  { id: 'timeline', icon: <History size={12} /> },
  { id: 'node-graph', icon: <CornerDownLeft size={12} /> },
];

export function Variables() {
  const { variables, collections, getCollectionName, commits } = useContext(AppContext);
  const [view, setView] = useState<'timeline' | 'node-graph'>('timeline');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedVariable, setSelectedVariable] = useState<Variable | null>(variables[0]);
  const [keyword, setKeyword] = useState<string>('');

  const modeMap = useMemo(() => {
    return Object.fromEntries(
      collections
        .map((c) => c.modes)
        .flat()
        .map((item) => [item.modeId, item.name])
    );
  }, [collections]);

  useEffect(() => {
    const selectedVariableDiv = document.getElementById(selectedVariable?.id + '');
    selectedVariableDiv?.scrollIntoView();
  }, [selectedVariable]);

  const groupedVariables = useMemo(() => {
    return groupBy(variables, (variable) => variable.variableCollectionId);
  }, [variables]);

  const handleClick = (variable: Variable) => {
    setSelectedVariable(variable);
  };
  const collection = useMemo(
    () => collections.find((c) => c.id === selectedVariable?.variableCollectionId),
    [selectedVariable, collections]
  );

  const header = (
    <div
      className="w-full h-10 px-3 border-b grow relative flex items-center justify-between"
      style={{ borderColor: 'var(--figma-color-border)' }}
    >
      <div className="font-medium flex items-center gap-2">
        <div style={{ color: 'var(--figma-color-text-secondary)' }}>{collection?.name}</div>
        <ChevronRight size={12} />
        {selectedVariable ? <VariableIcon resolvedType={selectedVariable?.resolvedType} /> : null}
        {selectedVariable?.name}
      </div>

      <div
        className="w-fit flex rounded-md p-0.5"
        style={{ background: 'var(--figma-color-bg-secondary)' }}
      >
        {viewOptions.map((option) => (
          <div
            key={option.id}
            className={clsx(
              'w-6 h-6 flex items-center justify-center gap-1 rounded',
              view === option.id ? 'bg-[color:var(--figma-color-bg)]' : 'bg-transparent'
            )}
            style={{
              color:
                view === option.id
                  ? 'var(--figma-color-text-brand)'
                  : 'var(--figma-color-text-secondary)',
            }}
            onClick={() => setView(option.id === 'timeline' ? 'timeline' : 'node-graph')}
          >
            {option.icon}
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    setNodes([]);
    setEdges([]);

    const aliases = variables.filter((v) => {
      if (
        Object.values(v.valuesByMode).find(
          (value) =>
            typeof value === 'object' && 'type' in value && value.id === selectedVariable?.id
        )
      ) {
        return true;
      } else {
        return false;
      }
    });

    if (selectedVariable) {
      const references = Object.entries(selectedVariable?.valuesByMode)
        .filter(([, value]) => typeof value === 'object' && 'type' in value)
        .map(([key, value]) => ({
          mode: modeMap[key],
          variable: variables.find((v) => v.id === (value as VariableAlias).id),
        }))
        .filter((item) => item.variable !== undefined);

      setNodes([
        {
          id: selectedVariable?.id,
          type: 'variable',
          data: { variable: selectedVariable },
          position: { x: 0, y: 0 },
          sourcePosition: Position.Right,
        },
        ...aliases.map((v, index) => ({
          id: v.id,
          type: 'variable',
          data: { variable: v, onClick: () => handleClick(v) },
          position: { x: (Math.floor(index / 10) + 1) * 320, y: (index % 10) * 50 },
          targetPosition: Position.Left,
          style: { width: 'fit-content' },
        })),
        ...references.map((item, index) => ({
          id: `${item.variable?.id}-${index}`,
          type: 'variable',
          data: {
            variable: item.variable,
            mode: item.mode,
            onClick: () => {
              item.variable && handleClick(item.variable);
            },
          },
          position: { x: -(Math.floor(index / 10) + 1) * 320, y: (index % 10) * 50 },
          targetPosition: Position.Left,
          style: { width: 'fit-content' },
        })),
      ]);

      setEdges([
        ...aliases.map((v) => ({
          id: `${selectedVariable.id}-${v.id}`,
          source: selectedVariable.id,
          target: v.id,
          animated: true,
        })),
        ...references.map((item, index) => ({
          id: `${item.variable?.id}-${index}-${selectedVariable.id}`,
          source: `${item.variable?.id}-${index}`,
          target: selectedVariable.id,
          animated: true,
        })),
      ]);
    }
  }, [selectedVariable, variables]);

  return (
    <div style={{ height: 'calc(100% - 40px)' }} className="w-full h-full flex">
      {commits.length > 0 ? (
        <>
          <div
            className="w-60 shrink-0 border-r"
            style={{
              background: 'var(--figma-color-bg-secondary)',
              borderColor: 'var(--figma-color-border)',
            }}
          >
            <Search value={keyword} onChange={setKeyword} onClear={() => setKeyword('')} />
            <div className="overflow-auto scroll-smooth" style={{ height: 'calc(100% - 40px)' }}>
              <Root type="multiple" className="p-1.5" defaultValue={Object.keys(groupedVariables)}>
                {Object.entries(groupedVariables).map(([collectionId, variablesInGroup]) => {
                  return (
                    <Item
                      style={{ background: 'var(--figma-color-bg)' }}
                      value={collectionId}
                      className={
                        'rounded-[4px] [&:not(:last-of-type)]:rounded-md [&:not(:last-of-type)]:mb-1.5'
                      }
                      key={collectionId}
                    >
                      <Header>
                        <Trigger
                          className={'w-full p-2 pr-3 flex items-center font-semibold gap-2 group'}
                        >
                          <div className="shrink-0 group-data-[state=open]:rotate-90 transition-all">
                            <ChevronRight size={11} />
                          </div>
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                            {getCollectionName(collectionId)}
                          </div>

                          <div
                            className="ml-auto px-1 rounded-sm"
                            style={{
                              color: 'var(--figma-color-text-secondary)',
                              background: 'var(--figma-color-bg-secondary)',
                            }}
                          >
                            {variablesInGroup.length}
                          </div>
                        </Trigger>
                      </Header>
                      <Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <div className="p-1">
                          {variablesInGroup
                            .filter((v) => v.name.includes(keyword))
                            .map((v) => {
                              const aliases = variables.filter(({ valuesByMode }) => {
                                if (
                                  Object.values(valuesByMode).find(
                                    (value) =>
                                      typeof value === 'object' &&
                                      'type' in value &&
                                      value.id === v?.id
                                  )
                                ) {
                                  return true;
                                } else {
                                  return false;
                                }
                              });

                              const aliasCount =
                                aliases.length > 0 ? (
                                  <div
                                    className="ml-auto flex items-center gap-0.5"
                                    style={{ color: 'var(--figma-color-text-secondary)' }}
                                  >
                                    {aliases.length}
                                    <CornerDownLeft className="inline-block w-2 h-2" />
                                  </div>
                                ) : null;

                              return (
                                <VariableItem
                                  selected={v.id === selectedVariable?.id}
                                  variable={v}
                                  key={v.id}
                                  onClick={() => handleClick(v)}
                                  allowDiscard={false}
                                  slot={aliasCount}
                                />
                              );
                            })}
                        </div>
                      </Content>
                    </Item>
                  );
                })}
              </Root>
            </div>
          </div>

          <div className="w-full h-full grow relative">
            {header}
            <div className="overflow-auto relative" style={{ height: 'calc(100% - 40px)' }}>
              {view === 'node-graph' ? (
                <ReactFlowProvider>
                  <NodeGraph nodes={nodes} edges={edges} />
                </ReactFlowProvider>
              ) : selectedVariable ? (
                <VariableTimeline variableId={selectedVariable?.id} />
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <NoCommitPlaceholder description="Make your first commit to view variable timeline here." />
      )}
    </div>
  );
}

function NodeGraph({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const { fitView } = useReactFlow();
  const nodeTypes = {
    variable: VariableNode,
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={() => fitView()}
      fitView
      nodeTypes={nodeTypes}
    >
      <Background variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}
