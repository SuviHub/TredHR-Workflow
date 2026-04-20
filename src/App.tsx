import { useEffect, useMemo } from "react";
import { ConfigPanel } from "./components/ConfigPanel";
import { NodePalette } from "./components/NodePalette";
import { TestWorkflowPanel } from "./components/TestWorkflowPanel";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { useWorkflowStore } from "./store/workflowStore";
import "./styles/app.css";

function App() {
  const {
    workflow,
    ui,
    onNodesChange,
    onEdgesChange,
    connectNodes,
    addNode,
    selectNode,
    updateNodeConfig,
    loadTemplate,
    saveWorkflow,
    runWorkflow,
    getNodes,
    getEdges,
  } = useWorkflowStore();

  const nodes = getNodes();
  const edges = getEdges();

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === ui.selectedNodeId),
    [nodes, ui.selectedNodeId],
  );

  return (
    <div className="page">
      <header className="topbar panel">
        <div>
          <h2>{workflow.name}</h2>
          <p className="muted">HR Workflow Designer with configurable nodes and simulation.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => void loadTemplate()} disabled={ui.loadingTemplate}>
            {ui.loadingTemplate ? "Loading..." : "Load Template"}
          </button>
          <button className="btn primary" onClick={() => void saveWorkflow()} disabled={ui.savingWorkflow}>
            {ui.savingWorkflow ? "Saving..." : "Save Workflow"}
          </button>
        </div>
      </header>

      <main className="layout">
        <NodePalette onAddNode={addNode} />
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={connectNodes}
          onNodeClick={selectNode}
          activeExecutionNodeId={ui.activeExecutionNodeId}
        />
        <ConfigPanel selectedNode={selectedNode} onChange={updateNodeConfig} />
      </main>

      <TestWorkflowPanel
        result={ui.executionResult}
        running={ui.runningWorkflow}
        validationErrors={ui.validationErrors}
        activeExecutionNodeId={ui.activeExecutionNodeId}
        onRun={async (leaveDays) => {
          await runWorkflow({ leaveDays });
        }}
      />
    </div>
  );
}

export default App;
