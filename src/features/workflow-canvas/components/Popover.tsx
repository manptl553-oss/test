import { useFlowStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";
import NodePickerPanel from "./NodePickerPanel";

export const Popover = () => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { getViewport, getNode } = useReactFlow();
  const rafRef = useRef<number | null>(null);

  const { activeNode } = useFlowStore();
  const isStartNode = activeNode?.data?.type === "start_workflow";

  const [side, setSide] = useState<"right" | "left">("right");
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [arrowY, setArrowY] = useState(0);

  if (!activeNode) return null;

  // -------------------------------
  // POSITION UPDATE LOOP
  // -------------------------------
  const updatePosition = () => {
    const rfNode = getNode(activeNode.id);

    if (!rfNode) {
      rafRef.current = requestAnimationFrame(updatePosition);
      return;
    }

    const domNode = document.querySelector(`[data-id="${activeNode.id}"]`);
    const popover = popoverRef.current;

    if (!domNode || !popover) {
      rafRef.current = requestAnimationFrame(updatePosition);
      return;
    }

    const nodeRect = (domNode as HTMLElement).getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();

    const margin = 12;

    // -------------------------------
    // LEFT / RIGHT POSITIONING
    // -------------------------------
    let left = nodeRect.right + margin;
    let newSide: "right" | "left" = "right";

    // If overflowing right → position on left
    if (left + popRect.width > window.innerWidth - 20) {
      left = nodeRect.left - popRect.width - margin;
      newSide = "left";
    }

    // -------------------------------
    // VERTICAL CENTERING
    // -------------------------------
    let top = nodeRect.top + nodeRect.height / 2 - popRect.height / 2;

    // Clamp inside viewport
    const minY = 20;
    const maxY = window.innerHeight - popRect.height - 20;
    top = Math.max(minY, Math.min(maxY, top));

    // -------------------------------
    // ARROW POSITION (Relative to popover)
    // -------------------------------
    const arrowPos = nodeRect.top + nodeRect.height / 2 - top ;

    setArrowY(arrowPos);
    setSide(newSide);

    // -------------------------------
    // FINAL STYLE
    // -------------------------------
    setStyle({
      position: "fixed",
      left,
      top,
      zIndex: 2000,
      willChange: "transform",
    });

    rafRef.current = requestAnimationFrame(updatePosition);
  };

  // Start tracking when popover opens
  useEffect(() => {
    updatePosition();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeNode]);

  return (
    <div
      ref={popoverRef}
      style={{
        ...style,
        width: 360,
<<<<<<< HEAD
        background: "#fff",
        border: "1px solid #e2e8f0",
=======
        background: "var(--wf-background-base, #ffffff)",
        border: "1px solid var(--wf-border-default, #e2e8f0)",
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
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
          borderLeft: side === "left" ? "8px solid var(--wf-background-base, #ffffff)" : "none",
          borderRight: side === "right" ? "8px solid var(--wf-background-base, #ffffff)" : "none",
        }}
      />

      <NodePickerPanel id={activeNode.id} isStartNode={isStartNode} />
    </div>
  );
};
