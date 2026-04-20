import type { NodeProps } from "reactflow";
import type { WorkflowNodeData } from "../types/workflow";
import { BaseNodeCard } from "./BaseNodeCard";

export const StartNode = ({ data }: NodeProps<WorkflowNodeData>) => (
  <BaseNodeCard title={data.config.label} subtitle="Start Node" color="#16a34a" />
);
