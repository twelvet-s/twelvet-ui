import { Node, Edge } from '@xyflow/react';

// Handle类型枚举
export enum HandleType {
  INPUT = 'input',
  OUTPUT = 'output'
}

// 节点数据接口
export interface NodeData {
  id: string;
  label: string;
  icon: string;
  color: string;
  description?: string;
  type: string;
  // 节点特定的配置
  config?: Record<string, any>;
  // 工具窗口相关回调
  onToolClick?: (event: React.MouseEvent, handleType?: HandleType) => void;
}

// 自定义节点类型
export type CustomNode = Node<NodeData>;

// 自定义边类型
export type CustomEdge = Edge;

// 节点类型枚举
export enum NodeType {
  START = 'start',
  END = 'end',
  AI_MODEL = 'ai-model',
  WORKFLOW = 'workflow',
  PLUGIN = 'plugin',
  CODE = 'code',
  INTENT = 'intent',
  SELECTOR = 'selector',
  LOOP = 'loop',
  INPUT = 'input',
  OUTPUT = 'output',
  DATABASE = 'database',
  KNOWLEDGE = 'knowledge',
}

// 节点样式配置
export const NODE_COLORS = {
  'start': '#52c41a',
  'end': '#ff4d4f',
  'ai-model': '#000000',
  'workflow': '#52c41a',
  'business': '#1890ff',
  'code': '#13c2c2',
  'selector': '#1890ff',
  'loop': '#52c41a',
  'batch': '#13c2c2',
  'input': '#722ed1',
  'output': '#722ed1',
  'database': '#fa8c16',
  'knowledge': '#fa8c16',
};

// 拖拽数据类型
export interface DragData {
  nodeType: string;
  label: string;
  icon: string;
  color: string;
  description?: string;
  // 拖拽源节点信息
  sourceNode?: {nodeId: string, handleType: string} | null;
}
