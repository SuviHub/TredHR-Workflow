import type { XYPosition } from "reactflow";
import { nodeRegistry } from "../nodes/registry";
import type { WorkflowNode, WorkflowNodeType } from "../types/workflow";

const randomOffset = () => Math.floor(Math.random() * 100);

export const createNode = (
  type: WorkflowNodeType,
  position?: XYPosition,
): WorkflowNode => {
  const id = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    id,
    type,
    position: position ?? { x: 120 + randomOffset(), y: 120 + randomOffset() },
    data: {
      type,
      config: structuredClone(nodeRegistry.getDefinition(type).createDefaultConfig()),
    },
  };
};
