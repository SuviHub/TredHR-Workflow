import type { ComponentType } from "react";
import type { NodeProps, NodeTypes } from "reactflow";
import { ActionNode } from "./ActionNode";
import { ApiCallNode } from "./ApiCallNode";
import { ApprovalNode } from "./ApprovalNode";
import { ConditionNode } from "./ConditionNode";
import { StartNode } from "./StartNode";
import type {
  ActionConfig,
  ApiCallConfig,
  ApprovalConfig,
  ConditionConfig,
  ExecutionContext,
  ExecutionStepLog,
  StartConfig,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeConfig,
  WorkflowNodeConfigMap,
  WorkflowNodeData,
  WorkflowNodeType,
} from "../types/workflow";

type ConfigFieldType = "text" | "number" | "select";

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface NodeExecutionResult {
  branchKey?: string;
  result: string;
}

type Awaitable<T> = T | Promise<T>;

export interface NodeExecutionInput {
  node: WorkflowNode;
  context: ExecutionContext;
  outgoingEdges: WorkflowEdge[];
}

export interface WorkflowNodeDefinition<T extends WorkflowNodeType> {
  type: T;
  label: string;
  component: ComponentType<NodeProps<WorkflowNodeData<T>>>;
  createDefaultConfig: () => WorkflowNodeConfigMap[T];
  configSchema: ConfigField[];
  validateConfig: (config: WorkflowNodeConfig) => string[];
  execute: (input: NodeExecutionInput) => Awaitable<NodeExecutionResult>;
}

const compare = (left: number, right: number, operator: WorkflowNodeConfigMap["condition"]["operator"]) => {
  switch (operator) {
    case "gt":
      return left > right;
    case "gte":
      return left >= right;
    case "lt":
      return left < right;
    case "lte":
      return left <= right;
    case "eq":
      return left === right;
    default:
      return false;
  }
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const definitions: {
  [K in WorkflowNodeType]: WorkflowNodeDefinition<K>;
} = {
  start: {
    type: "start",
    label: "Start Node",
    component: StartNode,
    createDefaultConfig: () => ({ label: "Start" }),
    configSchema: [{ key: "label", label: "Label", type: "text", required: true }],
    validateConfig: (config) => {
      const startConfig = config as StartConfig;
      return startConfig.label.trim() ? [] : ["Label is required"];
    },
    execute: () => ({ result: "Start event triggered." }),
  },
  approval: {
    type: "approval",
    label: "Approval Node",
    component: ApprovalNode,
    createDefaultConfig: () => ({
      label: "Approval",
      approverName: "Manager",
      role: "People Lead",
    }),
    configSchema: [
      { key: "label", label: "Label", type: "text", required: true },
      { key: "approverName", label: "Approver Name", type: "text", required: true },
      { key: "role", label: "Role", type: "text", required: true },
    ],
    validateConfig: (config) => {
      const approvalConfig = config as ApprovalConfig;
      const errors: string[] = [];
      if (!approvalConfig.label.trim()) errors.push("Label is required");
      if (!approvalConfig.approverName.trim()) errors.push("Approver name is required");
      if (!approvalConfig.role.trim()) errors.push("Role is required");
      return errors;
    },
    execute: ({ node }) => {
      const config = node.data.config as ApprovalConfig;
      return { result: `Awaiting approval from ${config.approverName} (${config.role}).` };
    },
  },
  condition: {
    type: "condition",
    label: "Condition Node",
    component: ConditionNode,
    createDefaultConfig: () => ({
      label: "Check Leave Days",
      field: "leaveDays",
      operator: "gt",
      value: 5,
    }),
    configSchema: [
      { key: "label", label: "Label", type: "text", required: true },
      { key: "field", label: "Condition Field", type: "text", required: true },
      {
        key: "operator",
        label: "Operator",
        type: "select",
        required: true,
        options: [
          { value: "gt", label: "Greater Than" },
          { value: "gte", label: "Greater Than or Equal" },
          { value: "lt", label: "Less Than" },
          { value: "lte", label: "Less Than or Equal" },
          { value: "eq", label: "Equal" },
        ],
      },
      { key: "value", label: "Value", type: "number", required: true },
    ],
    validateConfig: (config) => {
      const conditionConfig = config as ConditionConfig;
      const errors: string[] = [];
      if (!conditionConfig.label.trim()) errors.push("Label is required");
      if (!conditionConfig.field.trim()) errors.push("Condition field is required");
      return errors;
    },
    execute: ({ node, context }) => {
      const config = node.data.config as ConditionConfig;
      const passed = compare(context.leaveDays, config.value, config.operator);
      return {
        branchKey: passed ? "true" : "false",
        result: `${config.field} ${config.operator} ${config.value} => ${passed}`,
      };
    },
  },
  action: {
    type: "action",
    label: "Action Node",
    component: ActionNode,
    createDefaultConfig: () => ({
      label: "Notify",
      actionType: "notify",
      target: "HR Team",
    }),
    configSchema: [
      { key: "label", label: "Label", type: "text", required: true },
      {
        key: "actionType",
        label: "Action Type",
        type: "select",
        required: true,
        options: [
          { value: "email", label: "Email" },
          { value: "notify", label: "Notify" },
          { value: "update-status", label: "Update Status" },
        ],
      },
      { key: "target", label: "Target", type: "text", required: true },
    ],
    validateConfig: (config) => {
      const actionConfig = config as ActionConfig;
      const errors: string[] = [];
      if (!actionConfig.label.trim()) errors.push("Label is required");
      if (!actionConfig.target.trim()) errors.push("Target is required");
      return errors;
    },
    execute: ({ node }) => {
      const config = node.data.config as ActionConfig;
      return { result: `Action "${config.actionType}" executed on ${config.target}.` };
    },
  },
  apiCall: {
    type: "apiCall",
    label: "API Call Node",
    component: ApiCallNode,
    createDefaultConfig: () => ({
      label: "Call Leave Service",
      endpoint: "/api/leaves/validate",
      method: "POST",
      delayMs: 1200,
    }),
    configSchema: [
      { key: "label", label: "Label", type: "text", required: true },
      { key: "endpoint", label: "Endpoint", type: "text", required: true },
      {
        key: "method",
        label: "Method",
        type: "select",
        required: true,
        options: [
          { value: "GET", label: "GET" },
          { value: "POST", label: "POST" },
          { value: "PUT", label: "PUT" },
          { value: "PATCH", label: "PATCH" },
        ],
      },
      { key: "delayMs", label: "Delay (ms)", type: "number", required: true },
    ],
    validateConfig: (config) => {
      const apiConfig = config as ApiCallConfig;
      const errors: string[] = [];
      if (!apiConfig.label.trim()) errors.push("Label is required");
      if (!apiConfig.endpoint.trim()) errors.push("Endpoint is required");
      if (apiConfig.delayMs < 0) errors.push("Delay must be non-negative");
      return errors;
    },
    execute: async ({ node }) => {
      const config = node.data.config as ApiCallConfig;
      await wait(config.delayMs);
      return {
        result: `API ${config.method} ${config.endpoint} completed in ${config.delayMs}ms.`,
      };
    },
  },
};

export const nodeRegistry = {
  definitions,
  getDefinition<T extends WorkflowNodeType>(type: T): WorkflowNodeDefinition<T> {
    return definitions[type] as WorkflowNodeDefinition<T>;
  },
  list() {
    return Object.values(definitions);
  },
  getNodeTypes(): NodeTypes {
    return Object.fromEntries(
      Object.entries(definitions).map(([type, definition]) => [type, definition.component]),
    );
  },
  buildExecutionLog(nodeId: string, type: WorkflowNodeType, result: string): ExecutionStepLog {
    return {
      nodeId,
      type,
      result,
      timestamp: new Date().toISOString(),
    };
  },
};
