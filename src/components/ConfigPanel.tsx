import { nodeRegistry } from "../nodes/registry";
import type { WorkflowNode } from "../types/workflow";

interface ConfigPanelProps {
  selectedNode: WorkflowNode | undefined;
  onChange: (nodeId: string, patch: Record<string, string | number>) => void;
}

export const ConfigPanel = ({ selectedNode, onChange }: ConfigPanelProps) => {
  if (!selectedNode) {
    return (
      <aside className="right-sidebar panel">
        <h3>Node Configuration</h3>
        <p className="muted">Select a node to edit its configuration.</p>
      </aside>
    );
  }

  const { type, config } = selectedNode.data;
  const definition = nodeRegistry.getDefinition(type);

  const renderField = (key: string) => {
    const field = definition.configSchema.find((item) => item.key === key);
    if (!field) return null;

    if (field.type === "select") {
      return (
        <label key={field.key}>
          {field.label}
          <select
            value={String(config[field.key as keyof typeof config] ?? "")}
            onChange={(event) => onChange(selectedNode.id, { [field.key]: event.target.value })}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (field.type === "number") {
      return (
        <label key={field.key}>
          {field.label}
          <input
            type="number"
            value={Number(config[field.key as keyof typeof config] ?? 0)}
            onChange={(event) =>
              onChange(selectedNode.id, { [field.key]: Number(event.target.value) || 0 })
            }
          />
        </label>
      );
    }

    return (
      <label key={field.key}>
        {field.label}
        <input
          value={String(config[field.key as keyof typeof config] ?? "")}
          onChange={(event) => onChange(selectedNode.id, { [field.key]: event.target.value })}
        />
      </label>
    );
  };

  return (
    <aside className="right-sidebar panel">
      <h3>Node Configuration</h3>
      {definition.configSchema.map((field) => renderField(field.key))}
    </aside>
  );
};
