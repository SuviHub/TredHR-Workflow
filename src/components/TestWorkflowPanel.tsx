import { useState } from "react";
import type { ExecutionResult, ValidationError } from "../types/workflow";

interface TestWorkflowPanelProps {
  result: ExecutionResult | null;
  running: boolean;
  validationErrors: ValidationError[];
  activeExecutionNodeId: string | null;
  onRun: (leaveDays: number) => Promise<void>;
}

export const TestWorkflowPanel = ({
  result,
  running,
  validationErrors,
  activeExecutionNodeId,
  onRun,
}: TestWorkflowPanelProps) => {
  const [leaveDays, setLeaveDays] = useState<number>(7);

  const run = async () => {
    await onRun(leaveDays);
  };

  return (
    <section className="test-panel panel">
      <div className="test-actions">
        <h3>Test Workflow</h3>
        <label>
          Leave Days
          <input
            type="number"
            min={0}
            value={leaveDays}
            onChange={(event) => setLeaveDays(Number(event.target.value) || 0)}
          />
        </label>
        <button className="btn primary" onClick={run} disabled={running}>
          {running ? "Running..." : "Run Simulation"}
        </button>
      </div>
      <div className="logs">
        <div className="logs-title">Execution Logs</div>
        {!!validationErrors.length && (
          <div className="validation-errors">
            {validationErrors.map((error, index) => (
              <div key={`${error.code}-${error.nodeId ?? "global"}-${index}`} className="error">
                {error.message}
              </div>
            ))}
          </div>
        )}
        {!result ? (
          <div className="muted">Run simulation to inspect step-by-step execution.</div>
        ) : (
          <>
            <div className={result.success ? "success" : "error"}>
              Result: {result.success ? "Success" : "Failed"}
            </div>
            {result.logs.map((log) => (
              <div
                key={`${log.nodeId}-${log.timestamp}`}
                className={`log-row ${log.nodeId === activeExecutionNodeId ? "active-log" : ""}`}
              >
                <strong>{log.type}</strong> - {log.result}
                <div className="muted">{new Date(log.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
};
