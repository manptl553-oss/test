import { useFlowStore } from "@/store";
import { RefObject, useEffect, useRef, useState } from "react";
import "reactflow/dist/style.css";
import NodePickerPanel from "./NodePickerPanel";

export const Popover = ({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { activeModelId } = useFlowStore();
  const isStartNode = activeModelId === "start_workflow";

  useEffect(() => {
    if (!activeModelId || !containerRef.current || !popoverRef.current) return;

    const updatePosition = () => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      const nodeRect = document
        .querySelector(`[data-id='${activeModelId}']`)
        ?.getBoundingClientRect();
      const popoverRect = popoverRef.current!.getBoundingClientRect();

      if (!nodeRect) return;

      let top = nodeRect.top - containerRect.top;
      let left = nodeRect.right - containerRect.left + 10; // default right side

      // Auto adjust when hitting right edge
      if (left + popoverRect.width > containerRect.width) {
        left = nodeRect.left - containerRect.left - popoverRect.width - 10;
      }

      // Auto adjust when hitting bottom edge
      if (top + popoverRect.height > containerRect.height) {
        top = containerRect.height - popoverRect.height - 10;
      }

      setPosition({ top, left });
    };

    updatePosition();

    const observer = new ResizeObserver(updatePosition);
    observer.observe(containerRef.current);

    const interval = setInterval(updatePosition, 50); // follow node movement

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [activeModelId, containerRef]);

  if (!activeModelId) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        transition: "top 0.05s, left 0.05s",
        // pointerEvents: "none",
      }}
    >
      <NodePickerPanel id={activeModelId} isStartNode={isStartNode} />
    </div>
  );
};
