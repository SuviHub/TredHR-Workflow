import type { NodeProps } from "reactflow";
import type { ApiCallConfig, WorkflowNodeData } from "../types/workflow";
import { BaseNodeCard } from "./BaseNodeCard";

export const ApiCallNode = ({ data }: NodeProps<WorkflowNodeData>) => {
  const config = data.config as ApiCallConfig;

  return (
    <BaseNodeCard title={config.label} subtitle="API Call Node" color="#0d9488">
      <div>
        {config.method} {config.endpoint}
      </div>
      <div>{config.delayMs}ms simulated delay</div>
    </BaseNodeCard>
  );
};
