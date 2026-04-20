import ReactFlow, {
  Background,
  type Connection,
  Controls,
  type EdgeChange,
  type NodeChange,
  MiniMap,
  type Edge,
  Panel,
  ReactFlowProvider,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkflowNodeTypes } from "../hooks/useWorkflowFlow";
import type { WorkflowNodeData } from "../types/workflow";

interface WorkflowCanvasProps {
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (nodeId: string) => void;
  activeExecutionNodeId: string | null;
}

const FlowContent = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  activeExecutionNodeId,
}: WorkflowCanvasProps) => {
  const nodeTypes = useWorkflowNodeTypes();
  const visualNodes = nodes.map((node) => ({
    ...node,
    className: node.id === activeExecutionNodeId ? "node-running" : "",
  }));

  return (
    <ReactFlow
      nodes={visualNodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => onNodeClick(node.id)}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
      <Panel position="top-left" className="canvas-title">
        Workflow Canvas
      </Panel>
    </ReactFlow>
  );
};

export const WorkflowCanvas = (props: WorkflowCanvasProps) => (
  <section className="canvas-wrap panel">
    <ReactFlowProvider>
      <FlowContent {...props} />
    </ReactFlowProvider>
  </section>
);
