// ============================================
// CUSTOMNODE.TSX - FINAL UPDATED VERSION
// ============================================

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps, useStore, useStoreApi } from "reactflow";
import { Plus, Trash2 } from "lucide-react";
import { NodeConfigModal } from "./NodeConfigModal";
import { Button } from "@/shared";

const closedModel = ["vip_membership_invite", "pep_check_invite"];
const normalizeHandle = (handle?: string | null) =>
  handle?.toLowerCase() ?? "done";
const areHandlesEquivalent = (a: string, b: string): boolean => {
  if (a === b) return true;
  const groups = [
    ["next", "done", "none"],
    ["on_true", "true"],
    ["on_false", "false"],
  ];
  return groups.some((g) => g.includes(a) && g.includes(b));
};
const getLabel = (source: string | undefined) => {
  switch (source) {
    case "on_true":
      return "true";
    case "on_false":
      return "false";
    case "done":
    case "success":
    case "next":
      return undefined;
    default:
      return source;
  }
};

const CustomNode = ({ data, id }: NodeProps) => {
  const [showConfig, setShowConfig] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const store = useStoreApi();
  const edges = useStore((s) => s.edges);
  const Icon = data.icon;
  const isStartNode = (data as any).type === "start_workflow";

  // ✅ Report node ref to FlowCanvas (for popover anchor)
  useEffect(() => {
    if (isStartNode && nodeRef.current && (data as any).onStartNodeMount) {
      (data as any).onStartNodeMount(nodeRef);
    }
  }, [isStartNode, data]);


  const handleAddClick = useCallback(
    (handleId?: string) => (data as any).onAddClick?.(id, handleId),
    [data, id]
  );

  const handleDeleteClick = useCallback(async () => {
    try {
      const backendId = (data as any)?.backend_id as string | undefined;
      /* backend deletion hook could go here */
      (data as any).onDeleteClick?.(id);
    } catch (e) {
      console.error("Failed to delete node", e);
    }
  }, [data, id]);
const isPopoverOpen = (data as any).isPopoverOpen || false;
console.log("🚀 ~ CustomNode ~ isPopoverOpen:", isPopoverOpen)
const handleStartNodeClick = useCallback(() => {
  if (isStartNode && (data as any).onStartClick) {
    (data as any).onStartClick(id);
  }
}, [isStartNode, data, id]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        // Close modals or menus if any
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const handleDragStart = useCallback(
    (event: React.DragEvent, handleId: string) => {
      event.dataTransfer.setData("application/reactflow", "edge");
      event.dataTransfer.effectAllowed = "move";
      store.setState({
        connectionStartHandle: { nodeId: id, handleId, type: "source" },
      });
    },
    [store, id]
  );

  const handleDragEnd = useCallback(() => {
    store.setState({ connectionStartHandle: null });
  }, [store]);

  const isHandleConnected = useCallback(
    (outputId: string) => {
      const output = normalizeHandle(outputId);
      const nodeOutputs = (data as any).outputs?.map(normalizeHandle) || [];
      const hasSingleOutput = nodeOutputs.length === 1;
      return edges.some((edge) => {
        if (edge.source !== id) return false;
        const handle = normalizeHandle(edge.sourceHandle);
        if (areHandlesEquivalent(handle, output)) return true;
        if (hasSingleOutput && (!edge.sourceHandle || handle === "done"))
          return true;
        if (handle.startsWith("case_") && output.startsWith("case_"))
          return handle === output;
        const isLoopNode = (data as any).name?.toLowerCase()?.includes("loop");
        if (isLoopNode)
          return (
            (handle === "body" && output === "body") ||
            (handle === "done" && output === "done")
          );
        return false;
      });
    },
    [edges, id, (data as any).outputs, (data as any).name]
  );

  const renderInputHandles = () => {
    if (isStartNode) return null;

    if ((data as any).name?.toLowerCase() === "merge") {
      return Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`input-${i + 1}`}
          className="absolute flex items-center gap-1"
          style={{
            left: 0,
            top: `${(i + 1) * 20}%`,
            transform: "translateY(-50%)",
          }}
        >
          <span className="text-xs text-gray-500">{`Input ${i + 1}`}</span>
          <Handle
            type="target"
            position={Position.Left}
            id={`input-${i + 1}`}
            className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
          />
        </div>
      ));
    }
    return (
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-gray-400 border-2 border-gray-600"
        style={{ top: "50%" }}
      />
    );
  };

  const renderOutputHandles = () =>
    (data as any).outputs?.map((outputId: string, i: number) => {
      const verticalPos = `${
        (i + 1) * (100 / ((data as any).outputs.length + 1))
      }%`;
      const isConnected = isHandleConnected(outputId);
      const handleIdForAdd = outputId === "done" ? "next" : outputId;
      const label = getLabel(outputId);

      return (
        <div
          key={outputId}
          className="absolute right-0 flex items-center"
          style={{
            right: "0px",
            top: verticalPos,
            transform: "translateY(-50%)",
          }}
        >
          {label && (
            <div className="text-xs font-semibold pr-4">{label}</div>
          )}

          <Handle
            type="source"
            position={Position.Right}
            id={outputId}
            isConnectable={!isConnected}
            className={`w-3 h-3 border-2 border-gray-600 ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
            style={{
              top: "50%",
              right: -6,
              transform: "translateY(-50%)",
              pointerEvents: "all",
            }}
          />

          {!isConnected && (
            <div
              className="absolute flex items-center"
              style={{ right: "-28px", pointerEvents: "all" }}
            >
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, handleIdForAdd)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddClick(handleIdForAdd);
                }}
                className="w-4 h-4 bg-[var(--wf--brand-primary)] flex items-center justify-center rounded-full hover:opacity-100 cursor-crosshair transition-all duration-200"
              >
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>
      );
    });

  // ========================================
  // 🔥 Start Workflow Node Rendering
  // ========================================
if (isStartNode) {
  return (
    <div
      className="relative group"
      ref={nodeRef}
      style={{ pointerEvents: "all" }}
    >
      <div
        className={`w-32 h-32 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer ${
          isPopoverOpen
            ? "bg-[#16a34a] ring-4 ring-green-300 ring-opacity-50"
            : "bg-[#22c55e] hover:bg-[#16a34a]"
        }`}
        onClick={handleStartNodeClick}
      >
        <svg
          className="w-10 h-10 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <div className="text-white font-medium text-sm">Start Workflow</div>
      </div>

      {/* Output Handle */}
      <div
        className="absolute"
        style={{
          right: "-12px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <Handle
          type="source"
          position={Position.Right}
          id="next"
          className="w-3 h-3 bg-green-500 border-2 border-white"
          style={{ pointerEvents: "all" }}
        />

        {/* Plus Button with toggle animation */}
        <div
          className="absolute flex items-center"
          style={{
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "all",
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleStartNodeClick(); // This will trigger the toggle
            }}
            className={`w-5 h-5 border-2 border-white shadow-md hover:scale-110 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ${
              isPopoverOpen
                ? "bg-white text-[#22c55e] rotate-45"
                : "bg-[#22c55e] hover:bg-[#16a34a] text-white"
            }`}
          >
            <Plus className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}
  // ========================================
  // Regular Node Rendering
  // ========================================
  return (
    <div
      className="relative group"
      ref={nodeRef}
      onClick={() => {
        if (!closedModel.includes((data as any)?.type)) setShowConfig(true);
      }}
    >
      <div className="rounded-lg border-2 min-w-[160px] bg-[#2a2d3a] border-[#3a3d4a] shadow-lg relative">
        {renderInputHandles()}
        <div className="p-4 flex flex-col items-center gap-2">
          {Icon && (
            <div className="text-[var(--wf--brand-primary)]">
              <Icon className="w-8 h-8" />
            </div>
          )}
          <div className="font-medium text-sm text-white">
            {(data as any).name}
          </div>
        </div>
        {renderOutputHandles()}
      </div>

      {/* Delete Button */}
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          className="w-6 h-6 rounded-full bg-red-500"
          onClick={handleDeleteClick}
        >
          <Trash2 className="w-3 h-3 text-white" />
        </Button>
      </div>

      {/* Node Config Modal */}
      <NodeConfigModal
        open={showConfig}
        onOpenChange={setShowConfig}
        nodeId={id}
        nodeData={data}
      />
    </div>
  );
};

export default memo(CustomNode);
