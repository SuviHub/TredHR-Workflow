import type { Edge, Node } from "reactflow";

export type WorkflowNodeType = "start" | "approval" | "condition" | "action" | "apiCall";

export type ConditionOperator = "gt" | "gte" | "lt" | "lte" | "eq";
export type ActionType = "email" | "notify" | "update-status";
export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH";

export interface BaseNodeConfig {
  label: string;
}

export interface StartConfig extends BaseNodeConfig {}

export interface ApprovalConfig extends BaseNodeConfig {
  approverName: string;
  role: string;
}

export interface ConditionConfig extends BaseNodeConfig {
  field: string;
  operator: ConditionOperator;
  value: number;
}

export interface ActionConfig extends BaseNodeConfig {
  actionType: ActionType;
  target: string;
}

export interface ApiCallConfig extends BaseNodeConfig {
  endpoint: string;
  method: ApiMethod;
  delayMs: number;
}

export interface WorkflowNodeConfigMap {
  start: StartConfig;
  approval: ApprovalConfig;
  condition: ConditionConfig;
  action: ActionConfig;
  apiCall: ApiCallConfig;
}

export type WorkflowNodeConfig = WorkflowNodeConfigMap[WorkflowNodeType];

export type WorkflowNodeData<T extends WorkflowNodeType = WorkflowNodeType> = {
  type: T;
  config: WorkflowNodeConfigMap[T];
};

export type WorkflowNode<T extends WorkflowNodeType = WorkflowNodeType> = Node<WorkflowNodeData<T>>;
export type WorkflowEdge = Edge;

export interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionContext {
  leaveDays: number;
}

export interface ExecutionStepLog {
  nodeId: string;
  type: WorkflowNodeType;
  result: string;
  timestamp: string;
}

export interface ExecutionResult {
  success: boolean;
  logs: ExecutionStepLog[];
  visitedNodeIds: string[];
}

export interface ValidationError {
  code: "START_NODE" | "CYCLE" | "DISCONNECTED" | "CONFIG";
  message: string;
  nodeId?: string;
}

export interface WorkflowGraphState {
  id: string;
  name: string;
  nodeOrder: string[];
  nodesById: Record<string, WorkflowNode>;
  edgeOrder: string[];
  edgesById: Record<string, WorkflowEdge>;
}
