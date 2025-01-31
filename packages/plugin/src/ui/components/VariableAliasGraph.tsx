import { Edge, Handle, Node, NodeTypes, Position } from '@xyflow/react';

import { ReactFlow } from '@xyflow/react';
import { Background } from '@xyflow/react';
import { BackgroundVariant } from '@xyflow/react';
import { AppContext } from '../../AppContext';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { VariableIcon } from './VariableIcon';

const VariableFlowNode = memo(({ data }: { data: { variable: Variable } }) => {
  return (
    <>
      <Handle type="source" position={Position.Left} />
      <div className="w-48 h-fit bg-[var(--figma-color-bg)] rounded-[5px] border border-[var(--figma-color-border)]">
        <div className="flex items-center p-2 w-full gap-2">
          <VariableIcon resolvedType={data.variable.resolvedType} />
          {data.variable.name}
        </div>
      </div>
      <Handle type="target" position={Position.Right} />
    </>
  );
});

const nodeTypes: NodeTypes = {
  variable: VariableFlowNode,
};

export function VariableAliasGraph({ variableId }: { variableId: string }) {
  const { variables } = useContext(AppContext);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const variable = useMemo(
    () => variables.find((v) => v.id === variableId),
    [variables, variableId]
  );

  useEffect(() => {
    const variableNode = {
      id: variableId,
      data: { variable },
      position: { x: 0, y: 100 },
      type: 'variable',
    };
    const aliasNodes = variables
      .filter((v) =>
        Object.values(v.valuesByMode).find(
          (v) =>
            typeof v === 'object' &&
            'type' in v &&
            v.type === 'VARIABLE_ALIAS' &&
            v.id === variableId
        )
      )
      .map((v, index) => ({
        id: v.id,
        data: { variable: v },
        type: 'variable',
        position: { x: 300, y: 50 * index },
      }));

    const edges = aliasNodes.map((v) => ({
      id: `${v.id}-${variableId}`,
      source: v.id,
      target: variableId,
      animated: true,
    }));

    setNodes([...aliasNodes, variableNode]);
    setEdges(edges);
  }, [variable]);

  return (
    <div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // selectionOnDrag
        draggable
        nodeTypes={nodeTypes}
        panActivationKeyCode="Space"
        panOnDrag={false}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
      </ReactFlow>
    </div>
  );
}
