import { nodeRegistry } from "../nodes/registry";
import type { ExecutionContext, ExecutionResult, WorkflowDefinition, WorkflowEdge } from "../types/workflow";
import { getOutgoingEdges } from "../utils/graph";

const pickNextEdge = (outgoingEdges: WorkflowEdge[], branchKey?: string): WorkflowEdge | undefined => {
  if (!outgoingEdges.length) {
    return undefined;
  }
  if (!branchKey) {
    return outgoingEdges[0];
  }
  return outgoingEdges.find((edge) => edge.sourceHandle === branchKey) ?? outgoingEdges[0];
};

export const executeWorkflow = async (
  workflow: WorkflowDefinition,
  context: ExecutionContext,
): Promise<ExecutionResult> => {
  const nodesById = new Map(workflow.nodes.map((node) => [node.id, node]));
  const startNode = workflow.nodes.find((node) => node.data.type === "start");
  if (!startNode) {
      return {
      success: false,
      visitedNodeIds: [],
      logs: [nodeRegistry.buildExecutionLog("n/a", "start", "Execution failed: no Start node found.")],
    };
  }

  const visitedNodeIds: string[] = [];
  const visited = new Set<string>();
  const logs: ExecutionResult["logs"] = [];
  let currentNodeId: string | undefined = startNode.id;
  let success = true;

  while (currentNodeId) {
    if (visited.has(currentNodeId)) {
      success = false;
      const cyclicNode = nodesById.get(currentNodeId);
      logs.push(
        nodeRegistry.buildExecutionLog(
          currentNodeId,
          cyclicNode?.data.type ?? "start",
          "Execution stopped: cycle detected.",
        ),
      );
      break;
    }

    const currentNode = nodesById.get(currentNodeId);
    if (!currentNode) {
      success = false;
      logs.push(nodeRegistry.buildExecutionLog(currentNodeId, "start", "Execution stopped: node not found."));
      break;
    }

    visited.add(currentNode.id);
    visitedNodeIds.push(currentNode.id);

    const outgoingEdges = getOutgoingEdges(currentNode.id, workflow.edges);
    const definition = nodeRegistry.getDefinition(currentNode.data.type);
    const execution = await definition.execute({
      node: currentNode,
      context,
      outgoingEdges,
    });

    logs.push(nodeRegistry.buildExecutionLog(currentNode.id, currentNode.data.type, execution.result));
    const nextEdge = pickNextEdge(outgoingEdges, execution.branchKey);
    currentNodeId = nextEdge?.target;
  }

  return { success, logs, visitedNodeIds };
};
