import { Button, isTriggerNode, NodeTypeProps, nodeTypeStyles } from "@/shared";
import { useFlowStore } from "@/store";
import { PlusIcon, Trash2 } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef } from "react";
import {
  Handle,
  NodeProps,
  Position,
  useReactFlow,
  useStore,
  useStoreApi,
  XYPosition,
} from "reactflow";
import { NodeConfigModal } from "./NodeConfigModal";

const closedModel = ["vip_membership_invite", "pep_check_invite"];
const normalizeHandle = (handle?: string | null) =>
  handle?.toLowerCase() ?? "none";
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
  const { project } = useReactFlow();
  const nodeRef = useRef<HTMLDivElement>(null);
  const store = useStoreApi();
  const edges = useStore((s) => s.edges);
  const Icon = data.icon || PlusIcon;
  const isStartNode = (data as any).type === "start_workflow";
  const isAddNode = (data as any).type === "addNode";
  const name = data?.name || "start workflow";
  const style = nodeTypeStyles[data?.type as NodeTypeProps] ||
    nodeTypeStyles[data?.name as NodeTypeProps] || {
      bg: "#22c55e",
      border: "#15803d", // gray-400
    };

  const { activeNode, setActiveNode } = useFlowStore();
  const open = activeNode?.id === id;
  const isNodeConfigModelOpen =
    !isStartNode && !isAddNode && activeNode?.id === id;

  const handleClick = () => {
    setActiveNode(open ? null : data);
  };

  // ✅ Report node ref to FlowCanvas (for popover anchor)
  useEffect(() => {
    if (isStartNode && nodeRef.current && (data as any).onStartNodeMount) {
      (data as any).onStartNodeMount(nodeRef);
    }
  }, [isStartNode, data]);

  const handleAddClick = useCallback(
    (position: XYPosition, handleId?: string) =>
      (data as any).onAddClick?.(id, position, handleId),
    [data, id]
  );

  const handleDeleteClick = useCallback(async () => {
    try {
      /* backend deletion hook could go here */
      (data as any).onDeleteClick?.(id);
    } catch (e) {
      console.error("Failed to delete node", e);
    }
  }, [data, id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        // Close modals or menus if any
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
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
    if (isStartNode || isTriggerNode(data?.type)) return null;

    // MERGE NODE (multiple inputs)
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
          <span className="text-xs  text-gray-500">{`Input ${i + 1}`}</span>

          {/* LEFT-facing styled handle */}
          <div className="relative">
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${i + 1}`}
              className={`
              !w-6 !h-6
              !rounded-l-full 
              !border-none 
            `}
              style={{ background: style.bg }}
            />
          </div>
        </div>
      ));
    }

    // SIMPLE SINGLE INPUT
    return (
      <Handle
        type="target"
        position={Position.Left}
        id="input"
          className="!w-4 !h-4 !border-0 !bg-transparent !opacity-0"
        style={{ top: "50%", background: style.bg,  left: -2 }}
      />
    );
  };

  const renderOutputHandles = () => {
    if (isStartNode) return null;
    return (data as any).outputs?.map((outputId: string, i: number) => {
      const verticalPos = `${
        (i + 1) * (100 / ((data as any).outputs.length + 1))
      }%`;
      const isConnected = isHandleConnected(outputId);
      const handleIdForAdd = outputId === "none" ? "next" : outputId;
      const label = getLabel(outputId);

      return (
        <div
          key={outputId}
          className="absolute right-2 !top-1/2 -translate-y-1/2 flex items-center z-0 "
        >
          {label && <div className="text-xs font-semibold pr-4">{label}</div>}

          <div className="relative">
            <Handle
              type="source"
              position={Position.Right}
              id={outputId}
              isConnectable={!isConnected}
           className="react-flow__handle"
              style={{
                top: "50%",
                // right: -8,
                transform: "translateY(-50%)",
                pointerEvents: "all",
                // background: style.bg,

                width: 22,
                height: 22,
                borderRadius: "50%",
                opacity: 0,
                background: "transparent",
                right: "-1px",
                zIndex: 50, // ABOVE the + button
                position: "absolute",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isConnected) return;
                const { clientX, clientY } = e;
                const position = project({ x: clientX, y: clientY });
                handleAddClick(position, handleIdForAdd);
              }}
            />

            {/* + only if not connected */}
            {/* {!isConnected && (
              <div
                className="
                !top-[3px]
        absolute inset-0 !-left-0
        flex items-center justify-center 
        text-white text-xs font-light
        pointer-events-none
      "
              >
                +
              </div>
            )} */}
               {!isConnected && (
              <div
                className="absolute -right-2 top-1/2 -translate-y-1/2  w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-110 transition-transform pd-2"
                style={{
                  background: style.bg,
                  pointerEvents: "auto",
                  zIndex: 10,  // BELOW handle
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const { clientX, clientY } = e;
                  const position = project({ x: clientX, y: clientY });
                  handleAddClick(position, handleIdForAdd);
                }}
              >
                +
              </div>
            )}
          </div>
        </div>
      );
    });
  };
  return (
    <>
      <div className="relative group space-y-4 text-center" ref={nodeRef}>
        <div className="w-30 h-30 mx-auto relative space-y-3">
          {renderInputHandles()}
          <div
            className={`w-24  mx-auto h-24 border-white border-2 z-10 relative rounded-full transition-all duration-200  flex flex-col items-center justify-center gap-2 cursor-pointer`}
            style={{
              background: style.bg,
              transition: "all 0.3s ease-in-out",
            }}
            onClick={handleClick}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = `${style.border}90`;
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "white";
              el.style.transform = "scale(1)";
            }}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>
          {renderOutputHandles()}
          {!isAddNode && (
            <div className="text-black font-medium text-sm text-center">
              {name}
            </div>
          )}
        </div>

        {!isStartNode && (
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
        )}
      </div>
      {isNodeConfigModelOpen && <NodeConfigModal />}
    </>
  );
};

export default memo(CustomNode);
