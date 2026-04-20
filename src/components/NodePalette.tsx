import { nodeRegistry } from "../nodes/registry";
import type { WorkflowNodeType } from "../types/workflow";

interface NodePaletteProps {
  onAddNode: (type: WorkflowNodeType) => void;
}

const paletteItems = nodeRegistry.list().map((definition) => ({
  type: definition.type as WorkflowNodeType,
  label: definition.label,
}));

export const NodePalette = ({ onAddNode }: NodePaletteProps) => (
  <aside className="left-sidebar panel">
    <h3>Node Library</h3>
    {paletteItems.map((item) => (
      <button key={item.type} className="btn" onClick={() => onAddNode(item.type)}>
        + {item.label}
      </button>
    ))}
    <p className="muted">Tip: connect nodes by dragging handles between them.</p>
  </aside>
);
