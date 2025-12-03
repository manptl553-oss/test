import {
  Button,
  isTriggerNode,
  NodeExecutionStatus,
  NodeTypeProps,
} from "@/shared";
import { useFlowStore } from "@/store";
import { Check, CircleAlert, RefreshCw, Trash2 } from "lucide-react";
import { memo, useCallback, useEffect, useRef } from "react";
import {
  Handle,
  NodeProps,
  Position,
  useReactFlow,
  useStore,
  XYPosition,
} from "reactflow";
import WorkflowIcon from "./WorkflowIcon";

const normalizeHandle = (handle?: string | null) =>
  handle?.toLowerCase() ?? "none";
const areHandlesEquivalent = (a: string, b: string): boolean => {
  if (a === b) return true;
  const groups = [
    ["next", "done", "none"],
  ];
  return groups.some((g) => g.includes(a) && g.includes(b));
};

const CustomNode = ({ data, id }: NodeProps) => {
  const { project } = useReactFlow();
  const { nodeTypeMeta, nodeExecutionState } = useFlowStore();

  const executionStatus = nodeExecutionState?.[id] || null;

  const nodeRef = useRef<HTMLDivElement>(null);
  const store = useStoreApi();
  const edges = useStore((s) => s.edges);
<<<<<<< HEAD
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
=======
  const style = nodeTypeMeta.get(data?.type as NodeTypeProps) || {
    icon: undefined,
    color: "#6B7280",
    border: "rgba(107, 114, 128, 0.35)",
  };

  const isStartNode = data.type === "start_workflow";
  const isAddNode = data.type === NodeTypeProps.VOID;
  const name = data?.name || "start workflow";
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

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
          className="wf-merge-input-row"
          style={{
            left: 0,
            top: `${(i + 1) * 20}%`,
            transform: "translateY(-50%)",
          }}
        >
          <span className="wf-merge-input-label">{`Input ${i + 1}`}</span>

          {/* LEFT-facing styled handle */}
          <div className="wf-handle-wrapper">
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${i + 1}`}
              className="wf-handle-rounded"
              style={{ background: style.color }}
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
<<<<<<< HEAD
        className="wf-handle-invisible"
        style={{ top: "50%", background: style.bg,  left: -2 }}
=======
        className={`wf-input-row ${isConnected && "wf-handle-invisible"}`}
        style={{
          top: "50%",
          background: style.color,
          left: `${isConnected ? -2 : "6px"}`,
        }}
        isConnectable={!isConnected}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
      />
    );
  };

  const renderOutputHandles = () => {
    if (isStartNode) return null;
<<<<<<< HEAD
    return (data as any).outputs?.map((outputId: string, i: number) => {
      const verticalPos = `${
        (i + 1) * (100 / ((data as any).outputs.length + 1))
      }%`;
      const isConnected = isHandleConnected(outputId);
=======
    return data?.outputs?.map((outputId: string) => {
      // const verticalPos = `${(i + 1) * (100 / (data?.outputs.length + 1))}%`;
      const isConnected = isAddNode ? true : isOutputHandleConnected(outputId);
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
      const handleIdForAdd = outputId === "none" ? "next" : outputId;

      return (
        <div
          key={outputId}
          className="wf-output-row"
          style={{ zIndex: isConnected ? 50 : 51 }}
        >
          {/* {label && <div className="wf-output-label">{label}</div>} */}

          <div className="wf-handle-wrapper">
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
                zIndex: isConnected ? 50 : 51,
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
            {!isConnected && (
              <div
                className="wf-output-add"
                style={{
                  background: style.color,
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
      <div className="wf-node-wrapper" ref={nodeRef}>
        <div className="wf-node-shell">
          {renderInputHandles()}
          <div
            className="wf-node-core"
<<<<<<< HEAD
            style={{
              background: style.bg,
              transition: "all 0.3s ease-in-out",
            }}
            onClick={handleClick}
=======
            style={
              {
                ["--node-color"]: `${style.color}40`,
                background: style.color,
                transition: "all 0.3s ease-in-out",
              } as React.CSSProperties
            }
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = `${style.border}90`;
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
<<<<<<< HEAD
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "white";
=======
              const el = e.currentTarget;
              el.style.borderColor = "var(--wf-background-subtle)";
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
              el.style.transform = "scale(1)";
            }}
          >
            <WorkflowIcon
              nodeType={data.type}
              size={40}
            />
          </div>
<<<<<<< HEAD
          {renderOutputHandles()}
          {!isAddNode && (
            <div className="wf-node-name">
              {name}
=======
          {executionStatus && (
            <div className="wf-tooltip-wrapper">
              {/* Status Icon */}
              <div
                className={`wf-status-icon ${
                  executionStatus.status === NodeExecutionStatus.Completed
                    ? "wf-status-success"
                    : executionStatus.status === NodeExecutionStatus.Failed
                    ? "wf-status-error"
                    : "wf-status-running"
                }`}
              >
                {executionStatus.status === NodeExecutionStatus.Running && (
                  <RefreshCw className="wf-spin" />
                )}
                {executionStatus.status === NodeExecutionStatus.Completed && (
                  <Check />
                )}
                {executionStatus.status === NodeExecutionStatus.Failed && (
                  <CircleAlert />
                )}
              </div>

              {/* Tooltip */}
              <div
                className={`wf-tooltip ${
                  executionStatus.status === NodeExecutionStatus.Failed
                    ? "wf-tooltip-error"
                    : "wf-tooltip-success"
                }`}
              >
                {executionStatus.status === NodeExecutionStatus.Failed
                  ? (executionStatus?.data as { error: string })?.error ||
                    "Execution Failed"
                  : "Execution Completed"}
              </div>
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
            </div>
          )}
          {renderOutputHandles()}
          {!isAddNode && <div className="wf-node-name">{name}</div>}
        </div>

        {!isStartNode && (
<<<<<<< HEAD
          <div
            className="wf-node-toolbar"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              className="wf-node-toolbar-btn"
              onClick={handleDeleteClick}
            >
=======
          <div className="wf-node-toolbar" onClick={(e) => e.stopPropagation()}>
            <Button className="wf-btn--destructive" onClick={handleDeleteClick}>
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
              <Trash2 className="wf-node-toolbar-icon" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(CustomNode);
