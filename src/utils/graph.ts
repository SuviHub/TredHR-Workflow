import type { Edge } from "reactflow";

export const getOutgoingEdges = (nodeId: string, edges: Edge[]): Edge[] =>
  edges.filter((edge) => edge.source === nodeId);

export const getIncomingEdges = (nodeId: string, edges: Edge[]): Edge[] =>
  edges.filter((edge) => edge.target === nodeId);
