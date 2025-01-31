export enum NodeType {
  MODE = 'MODE',
  VARIABLE = 'VARIABLE',
}

export type ModeNode = {
  type: NodeType.MODE;
  variableId: string;
  modeId: string;
};

export type VariableNode = {
  type: NodeType.VARIABLE;
  variableId: string;
};

export type Node = ModeNode | VariableNode;
