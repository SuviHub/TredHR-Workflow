import { nodeRegistry } from "../nodes/registry";
import type { ValidationError, WorkflowDefinition } from "../types/workflow";
import { getOutgoingEdges } from "../utils/graph";

const detectCycle = (workflow: WorkflowDefinition): ValidationError[] => {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const errors: ValidationError[] = [];
  const nodesById = new Map(workflow.nodes.map((node) => [node.id, node]));

  const dfs = (nodeId: string) => {
    if (visiting.has(nodeId)) {
      errors.push({ code: "CYCLE", message: "Workflow contains a cycle.", nodeId });
      return;
    }
    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    const outgoing = getOutgoingEdges(nodeId, workflow.edges);
    for (const edge of outgoing) {
      if (nodesById.has(edge.target)) {
        dfs(edge.target);
      }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  for (const node of workflow.nodes) {
    dfs(node.id);
  }
  return errors;
};

export const validateWorkflow = (workflow: WorkflowDefinition): ValidationError[] => {
  const errors: ValidationError[] = [];
  const startNodes = workflow.nodes.filter((node) => node.data.type === "start");

  if (startNodes.length !== 1) {
    errors.push({
      code: "START_NODE",
      message: `Expected exactly one Start node, found ${startNodes.length}.`,
    });
  }

  errors.push(...detectCycle(workflow));

  if (startNodes.length === 1) {
    const reachable = new Set<string>();
    const stack: string[] = [startNodes[0].id];

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || reachable.has(current)) continue;
      reachable.add(current);
      for (const edge of getOutgoingEdges(current, workflow.edges)) {
        stack.push(edge.target);
      }
    }

    for (const node of workflow.nodes) {
      if (!reachable.has(node.id)) {
        errors.push({
          code: "DISCONNECTED",
          message: "Node is disconnected from Start traversal.",
          nodeId: node.id,
        });
      }
    }
  }

  for (const node of workflow.nodes) {
    const definition = nodeRegistry.getDefinition(node.data.type);
    const configErrors = definition.validateConfig(node.data.config);
    for (const message of configErrors) {
      errors.push({ code: "CONFIG", message, nodeId: node.id });
    }
  }

  return errors;
};
