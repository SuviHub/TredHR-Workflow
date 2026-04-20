import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "reactflow";
import { create } from "zustand";
import { executeWorkflow } from "../services/executionEngine";
import { workflowApi } from "../services/workflowApi";
import { validateWorkflow } from "../services/workflowValidation";
import type {
  ExecutionContext,
  ExecutionResult,
  ValidationError,
  WorkflowDefinition,
  WorkflowGraphState,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeConfigMap,
  WorkflowNodeType,
} from "../types/workflow";
import { createNode } from "../utils/nodeFactory";

interface WorkflowUiState {
  selectedNodeId: string | null;
  activeExecutionNodeId: string | null;
  executionResult: ExecutionResult | null;
  validationErrors: ValidationError[];
  loadingTemplate: boolean;
  savingWorkflow: boolean;
  runningWorkflow: boolean;
}

interface WorkflowState {
  workflow: WorkflowGraphState;
  ui: WorkflowUiState;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  connectNodes: (connection: Connection) => void;
  addNode: (type: WorkflowNodeType) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeConfig: <T extends WorkflowNodeType>(
    nodeId: string,
    config: Partial<WorkflowNodeConfigMap[T]>,
  ) => void;
  loadTemplate: () => Promise<void>;
  saveWorkflow: () => Promise<void>;
  runWorkflow: (context: ExecutionContext) => Promise<void>;
  clearExecution: () => void;
  getWorkflowDefinition: () => WorkflowDefinition;
  getNodes: () => WorkflowNode[];
  getEdges: () => WorkflowEdge[];
}

const toGraphState = (workflow: WorkflowDefinition): WorkflowGraphState => ({
  id: workflow.id,
  name: workflow.name,
  nodeOrder: workflow.nodes.map((node) => node.id),
  nodesById: Object.fromEntries(workflow.nodes.map((node) => [node.id, node])),
  edgeOrder: workflow.edges.map((edge) => edge.id),
  edgesById: Object.fromEntries(workflow.edges.map((edge) => [edge.id, edge])),
});

const fromGraphState = (graph: WorkflowGraphState): WorkflowDefinition => ({
  id: graph.id,
  name: graph.name,
  nodes: graph.nodeOrder.map((id) => graph.nodesById[id]).filter(Boolean),
  edges: graph.edgeOrder.map((id) => graph.edgesById[id]).filter(Boolean),
});

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Separate persisted workflow graph from transient UI state for cleaner updates.
  workflow: {
    id: "designer-workflow",
    name: "New Workflow",
    nodeOrder: [],
    nodesById: {},
    edgeOrder: [],
    edgesById: {},
  },
  ui: {
    selectedNodeId: null,
    activeExecutionNodeId: null,
    executionResult: null,
    validationErrors: [],
    loadingTemplate: false,
    savingWorkflow: false,
    runningWorkflow: false,
  },

  onNodesChange: (changes) =>
    set((state) => ({
      workflow: toGraphState({
        ...fromGraphState(state.workflow),
        nodes: applyNodeChanges(changes, get().getNodes()) as WorkflowNode[],
      }),
    })),

  onEdgesChange: (changes) =>
    set((state) => ({
      workflow: toGraphState({
        ...fromGraphState(state.workflow),
        edges: applyEdgeChanges(changes, get().getEdges()),
      }),
    })),

  connectNodes: (connection) =>
    set((state) => ({
      workflow: toGraphState({
        ...fromGraphState(state.workflow),
        edges: addEdge(
          {
            ...connection,
            id: `${connection.source}-${connection.target}-${Date.now()}`,
            animated: false,
          },
          get().getEdges(),
        ),
      }),
    })),

  addNode: (type) =>
    set((state) => ({
      workflow: toGraphState({
        ...fromGraphState(state.workflow),
        nodes: [...get().getNodes(), createNode(type)],
      }),
    })),

  selectNode: (nodeId) =>
    set((state) => ({
      ui: { ...state.ui, selectedNodeId: nodeId },
    })),

  updateNodeConfig: (nodeId, config) =>
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodesById: {
          ...state.workflow.nodesById,
          [nodeId]: {
            ...state.workflow.nodesById[nodeId],
            data: {
              ...state.workflow.nodesById[nodeId].data,
              config: {
                ...state.workflow.nodesById[nodeId].data.config,
                ...config,
              },
            },
          },
        },
      },
    })),

  loadTemplate: async () => {
    set((state) => ({ ui: { ...state.ui, loadingTemplate: true } }));
    const templates = await workflowApi.fetchWorkflowTemplates();
    const template = templates[0];
    if (!template) {
      set((state) => ({ ui: { ...state.ui, loadingTemplate: false } }));
      return;
    }

    const nextWorkflow = toGraphState(template);
    set((state) => ({
      workflow: nextWorkflow,
      ui: {
        ...state.ui,
        selectedNodeId: null,
        validationErrors: validateWorkflow(template),
        loadingTemplate: false,
      },
    }));
  },

  saveWorkflow: async () => {
    set((state) => ({ ui: { ...state.ui, savingWorkflow: true } }));
    await workflowApi.saveWorkflow(get().getWorkflowDefinition());
    set((state) => ({ ui: { ...state.ui, savingWorkflow: false } }));
  },

  runWorkflow: async (context) => {
    const workflow = get().getWorkflowDefinition();
    const validationErrors = validateWorkflow(workflow);
    if (validationErrors.length) {
      set((state) => ({
        ui: {
          ...state.ui,
          validationErrors,
          executionResult: null,
          activeExecutionNodeId: null,
        },
      }));
      return;
    }

    set((state) => ({
      ui: {
        ...state.ui,
        runningWorkflow: true,
        validationErrors: [],
      },
    }));
    await workflowApi.runWorkflow(workflow);
    const executionResult = await executeWorkflow(workflow, context);
    set((state) => ({
      ui: {
        ...state.ui,
        runningWorkflow: false,
        executionResult,
        activeExecutionNodeId: executionResult.visitedNodeIds.at(-1) ?? null,
      },
    }));
  },

  clearExecution: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        executionResult: null,
        activeExecutionNodeId: null,
      },
    })),

  getWorkflowDefinition: () => {
    return fromGraphState(get().workflow);
  },

  getNodes: () => get().workflow.nodeOrder.map((id) => get().workflow.nodesById[id]).filter(Boolean),
  getEdges: () => get().workflow.edgeOrder.map((id) => get().workflow.edgesById[id]).filter(Boolean),
}));

export const buildExecutionContext = (leaveDays: number): ExecutionContext => ({
  leaveDays,
});
