import type { ReactNode } from "react";
import { Handle, Position } from "reactflow";

interface BaseNodeCardProps {
  title: string;
  subtitle: string;
  color: string;
  children?: ReactNode;
  isCondition?: boolean;
}

export const BaseNodeCard = ({
  title,
  subtitle,
  color,
  children,
  isCondition = false,
}: BaseNodeCardProps) => (
  <div className="node-card" style={{ borderColor: color }}>
    <Handle type="target" position={Position.Left} />
    <div className="node-title">{title}</div>
    <div className="node-subtitle">{subtitle}</div>
    {children ? <div className="node-meta">{children}</div> : null}
    {isCondition ? (
      <>
        <Handle id="true" type="source" position={Position.Right} style={{ top: "35%" }} />
        <Handle id="false" type="source" position={Position.Right} style={{ top: "65%" }} />
      </>
    ) : (
      <Handle type="source" position={Position.Right} />
    )}
  </div>
);
