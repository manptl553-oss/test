import React, { memo, useMemo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "reactflow";
import { Settings } from "lucide-react";
const CustomEdge = memo((props: EdgeProps & { data?: any }) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    selected,
  } = props;
  const [showMenu, setShowMenu] = useState(false);
  const strokeColor = selected
    ? "#7EC040"
    : (style as any)?.stroke || "#4b5563";
  const strokeWidth = selected ? 3 : (style as any)?.strokeWidth || 2;
  const markerId = useMemo(() => `arrow-${id}`, [id]);
  const [edgePath, midX, midY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const ArrowMarker = () => (
    <marker
      id={markerId}
      viewBox="0 0 10 10"
      refX="8"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
    </marker>
  );
  return (
    <>
      <defs>
        <ArrowMarker />
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${markerId})`}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          fill: "none",
          strokeDasharray: "none",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(${midX}px, ${midY}px) translateX(-50%)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex flex-col items-center"
        >
          <button
            className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--wf-brand-primary)] text-white shadow"
            onClick={() => setShowMenu((p) => !p)}
          >
            <Settings className="w-3 h-3" />
          </button>
          {showMenu && (
            <div className="mt-2 text-xs bg-white border border-[var(--wf-border-default)] rounded px-2 py-1">
              Edge Settings
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
CustomEdge.displayName = "CustomEdge";
export default CustomEdge;
