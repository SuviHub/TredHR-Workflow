import type { NodeTypes } from "reactflow";
import { nodeRegistry } from "../nodes/registry";

const workflowNodeTypes: NodeTypes = nodeRegistry.getNodeTypes();

export const useWorkflowNodeTypes = (): NodeTypes => workflowNodeTypes;
