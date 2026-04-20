import type { NodeProps } from "reactflow";
import type { ConditionConfig, WorkflowNodeData } from "../types/workflow";
import { BaseNodeCard } from "./BaseNodeCard";

export const ConditionNode = ({ data }: NodeProps<WorkflowNodeData>) => {
  const config = data.config as ConditionConfig;
  const operatorLabel = { gt: ">", gte: ">=", lt: "<", lte: "<=", eq: "=" }[config.operator];

  return (
    <BaseNodeCard title={config.label} subtitle="Condition Node" color="#ca8a04" isCondition>
      <div>
        {config.field} {operatorLabel} {config.value}
      </div>
      <div className="condition-legend">true / false branches</div>
    </BaseNodeCard>
  );
};
