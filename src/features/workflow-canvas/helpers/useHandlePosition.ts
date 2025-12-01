// src/hooks/useHandlePosition.ts
import { useMemo } from "react";
import { useReactFlow, useStore } from "reactflow";

export const useHandlePosition = (
  nodeId: string,
  type: "source" | "target",
  handleId?: string
) => {
  const { getNode } = useReactFlow();
  const edges = useStore((s) => s.edges);

  return useMemo(() => {
    const node = getNode(nodeId);
    if (!node?.width || !node?.height) return null;

    const centerX = node.position.x + node.width / 2;
    const centerY = node.position.y + node.height / 2;
    const radius = 48; // 24px node + 24px handle offset

    // Find connected edge
    const edge = edges.find(
      (e) =>
        (type === "source" && e.source === nodeId && (!handleId || e.sourceHandle === handleId)) ||
        (type === "target" && e.target === nodeId && (!handleId || e.targetHandle === handleId))
    );

    if (!edge) {
      // Default: right for source, left for target
      return type === "source"
        ? { x: centerX + radius, y: centerY, angle: 0 }
        : { x: centerX - radius, y: centerY, angle: 180 };
    }

    const connectedNode = getNode(type === "source" ? edge.target : edge.source);
    if (!connectedNode) return null;

    const connX = connectedNode.position.x + (connectedNode.width ?? 0) / 2;
    const connY = connectedNode.position.y + (connectedNode.height ?? 0) / 2;

    const dx = connX - centerX;
    const dy = connY - centerY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);

    return { x, y, angle: angleDeg };
  }, [nodeId, type, handleId, edges, getNode]);
};