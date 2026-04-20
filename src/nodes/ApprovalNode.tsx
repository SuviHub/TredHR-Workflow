import type { NodeProps } from "reactflow";
import type { ApprovalConfig, WorkflowNodeData } from "../types/workflow";
import { BaseNodeCard } from "./BaseNodeCard";

export const ApprovalNode = ({ data }: NodeProps<WorkflowNodeData>) => {
  const config = data.config as ApprovalConfig;

  return (
    <BaseNodeCard title={config.label} subtitle="Approval Node" color="#2563eb">
      <div>{config.approverName}</div>
      <div>{config.role}</div>
    </BaseNodeCard>
  );
};
