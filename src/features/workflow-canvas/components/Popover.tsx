import { useFlowStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import NodePickerPanel from "./NodePickerPanel";

export const Popover = () => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { getNode } = useReactFlow();
  const rafRef = useRef<number | null>(null);
  const lastPositionRef = useRef({ left: 0, top: 0, arrowY: 0, side: "right" });

  const { activeNode } = useFlowStore();
  const isStartNode = activeNode?.data?.type === "start_workflow";

  const [side, setSide] = useState<"right" | "left">("right");
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [arrowY, setArrowY] = useState(0);

  if (!activeNode) return null;

  // -------------------------------
  // OPTIMIZED POSITION UPDATE LOOP
  // -------------------------------
  const updatePosition = () => {
    const rfNode = getNode(activeNode.id);
    const domNode = document.querySelector(`[data-id="${activeNode.id}"]`);
    const popover = popoverRef.current;

    if (!rfNode || !domNode || !popover) {
      rafRef.current = requestAnimationFrame(updatePosition);
      return;
    }

    const nodeRect = (domNode as HTMLElement).getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();
    const margin = 12;

    // -------------------------------
    // CALCULATE POSITIONS
    // -------------------------------
    let left = nodeRect.right + margin;
    let newSide: "right" | "left" = "right";

    // If overflowing right → position on left
    if (left + popRect.width > window.innerWidth - 20) {
      left = nodeRect.left - popRect.width - margin;
      newSide = "left";
    }

    // Vertical centering
    let top = nodeRect.top + nodeRect.height / 2 - popRect.height / 2;

    // Clamp inside viewport
    const minY = 20;
    const maxY = window.innerHeight - popRect.height - 20;
    top = Math.max(minY, Math.min(maxY, top));

    // Arrow position
    const arrowPos = nodeRect.top + nodeRect.height / 2 - top;

    // -------------------------------
    // ✅ ONLY UPDATE IF POSITION CHANGED
    // -------------------------------
    const lastPos = lastPositionRef.current;
    const hasChanged =
      Math.abs(lastPos.left - left) > 0.5 ||
      Math.abs(lastPos.top - top) > 0.5 ||
      Math.abs(lastPos.arrowY - arrowPos) > 0.5 ||
      lastPos.side !== newSide;

    if (hasChanged) {
      lastPositionRef.current = { left, top, arrowY: arrowPos, side: newSide };

      setStyle({
        position: "fixed",
        left,
        top,
        zIndex: 2000,
        willChange: "transform",
      });
      setArrowY(arrowPos);
      setSide(newSide);
    }

    rafRef.current = requestAnimationFrame(updatePosition);
  };

  // Start tracking when popover opens
  useEffect(() => {
    rafRef.current = requestAnimationFrame(updatePosition);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeNode?.id]); // ✅ Only restart when node changes

  return (
    <div
      ref={popoverRef}
      style={{
        ...style,
        width: 360,
        background: "var(--wf-background-base, #ffffff)",
        border: "1px solid var(--wf-border-default, #e2e8f0)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
        pointerEvents: "auto",
      }}
    >
      {/* ---- ARROW ---- */}
      <div
        style={{
          position: "absolute",
          top: arrowY,
          transform: "translateY(-50%)",
          [side === "right" ? "left" : "right"]: "-8px",
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderLeft: side === "left" ? "8px solid #fff" : "none",
          borderRight: side === "right" ? "8px solid #fff" : "none",
        }}
      />

      <NodePickerPanel id={activeNode.id} isStartNode={isStartNode} />
    </div>
  );
};
