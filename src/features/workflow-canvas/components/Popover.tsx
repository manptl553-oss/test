import { useFlowStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import NodePickerPanel from "./NodePickerPanel";

export const Popover = () => {
  const popoverRef = useRef(null);
  const [side, setSide] = useState("right");
  const [style, setStyle] = useState({});
  const { getViewport, getNode } = useReactFlow();
  const rafRef = useRef(null);
  const { activeNode } = useFlowStore();
  const isStartNode = activeNode?.data?.type == "start_workflow";

  useEffect(() => {
    if (!activeNode || !popoverRef.current) return;

    const updatePosition = () => {
      const viewport = getViewport();
      const reactFlowNode = getNode(activeNode.id);

      if (!reactFlowNode) {
        rafRef.current = requestAnimationFrame(updatePosition);
        return;
      }

      const popoverRect = popoverRef.current.getBoundingClientRect();
      const popoverWidth = 280;
      const popoverHeight = popoverRect.height || 400;

      // Calculate node's screen position using transform
      const nodeScreenX = reactFlowNode.position.x * viewport.zoom + viewport.x;
      const nodeScreenY = reactFlowNode.position.y * viewport.zoom + viewport.y;

      // Node dimensions scaled by zoom
      const nodeWidth = 150 * viewport.zoom;
      const nodeHeight = 40 * viewport.zoom;

      const margin = 12;
      let newSide = "right";
      let translateX = nodeScreenX + nodeWidth + margin;

      // Check if popover overflows right edge
      if (translateX + popoverWidth > window.innerWidth - 20) {
        translateX = nodeScreenX - popoverWidth - margin;
        newSide = "left";
      }

      // Center vertically with node
      let translateY = nodeScreenY + nodeHeight / 2;

      // Keep within viewport bounds
      const maxY = window.innerHeight - popoverHeight / 2 - 20;
      const minY = popoverHeight / 2 + 20;
      translateY = Math.max(minY, Math.min(maxY, translateY));

      setSide(newSide);
      setStyle({
        position: "fixed",
        left: "0px",
        top: "0px",
        transform: `translate(${translateX}px, ${translateY}px) translateY(-50%)`,
        willChange: "transform",
      });

      rafRef.current = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [activeNode, getViewport, getNode]);

  if (!activeNode) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        ...style,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        width: "280px",
        pointerEvents: "auto",
        zIndex: 1000,
        transition: "none",
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          [side === "right" ? "left" : "right"]: "-8px",
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderLeft: side === "right" ? "8px solid #fff" : "none",
          borderRight: side === "left" ? "8px solid #fff" : "none",
        }}
      />

      <NodePickerPanel id={activeNode.id} isStartNode={isStartNode} />
    </div>
  );
};
