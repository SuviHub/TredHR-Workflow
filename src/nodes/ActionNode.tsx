import type { NodeProps } from "reactflow";
import type { ActionConfig, WorkflowNodeData } from "../types/workflow";
import { BaseNodeCard } from "./BaseNodeCard";

export const ActionNode = ({ data }: NodeProps<WorkflowNodeData>) => {
  const config = data.config as ActionConfig;

  return (
    <BaseNodeCard title={config.label} subtitle="Action Node" color="#7c3aed">
      <div>{config.actionType}</div>
      <div>{config.target}</div>
    </BaseNodeCard>
  );
};
