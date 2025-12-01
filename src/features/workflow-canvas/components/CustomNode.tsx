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
  XYPosition
} from "reactflow";
import WorkflowIcon from "./WorkflowIcon";

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
  const {  nodeTypeMeta, nodeExecutionState } = useFlowStore();

  const executionStatus = nodeExecutionState?.[id] || null;

  const nodeRef = useRef<HTMLDivElement>(null);
  const edges = useStore((s) => s.edges);
  const style = nodeTypeMeta.get(data?.type as NodeTypeProps) || {
    icon: undefined,
    color: "#6B7280",
    border: "rgba(107, 114, 128, 0.35)",
  };

  const isStartNode = data.type === "start_workflow";
  const isAddNode = data.type === "void_node";
  const name = data?.name || "start workflow";

  // ✅ Report node ref to FlowCanvas (for popover anchor)
  useEffect(() => {
    if (isStartNode && nodeRef.current && data.onStartNodeMount) {
      data?.onStartNodeMount(nodeRef);
    }
  }, [isStartNode, data]);

  const handleAddClick = useCallback(
    (position: XYPosition, handleId?: string) =>
      data?.onAddClick?.(id, position, handleId),
    [data, id]
  );

  const handleDeleteClick = useCallback(async () => {
    try {
      /* backend deletion hook could go here */
      data?.onDeleteClick?.(id);
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

  // const handleDragStart = useCallback(
  //   (event: React.DragEvent, handleId: string) => {
  //     event.dataTransfer.setData("application/reactflow", "edge");
  //     event.dataTransfer.effectAllowed = "move";
  //     store.setState({
  //       connectionStartHandle: { nodeId: id, handleId, type: "source" },
  //     });
  //   },
  //   [store, id]
  // );

  // const handleDragEnd = useCallback(() => {
  //   store.setState({ connectionStartHandle: null });
  // }, [store]);

  const isOutputHandleConnected = useCallback(
    (outputId: string) => {
      const output = normalizeHandle(outputId);
      const nodeOutputs = data?.outputs?.map(normalizeHandle) || [];
      const hasSingleOutput = nodeOutputs.length === 1;
      return edges.some((edge) => {
        if (edge.source !== id) return false;
        const handle = normalizeHandle(edge.sourceHandle);
        if (areHandlesEquivalent(handle, output)) return true;
        if (hasSingleOutput && (!edge.sourceHandle || handle === "done"))
          return true;
        if (handle.startsWith("case_") && output.startsWith("case_"))
          return handle === output;
        const isLoopNode = data?.name?.toLowerCase()?.includes("loop");
        if (isLoopNode)
          return (
            (handle === "body" && output === "body") ||
            (handle === "done" && output === "done")
          );
        return false;
      });
    },
    [edges, id, data?.outputs, data?.name]
  );

  const isInputHandleConnected = useCallback(
    () => edges.some((edge) => edge.target === id),
    [edges, id]
  );
  const renderInputHandles = () => {
    const isConnected = isInputHandleConnected();
    if (isStartNode || isTriggerNode(data?.type)) return null;

    // MERGE NODE (multiple inputs)
    if (data?.name?.toLowerCase() === "merge") {
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
        className={`wf-input-row ${isConnected && "wf-handle-invisible"}`}
        style={{
          top: "50%",
          background: style.color,
          left: `${isConnected ? -2 : "6px"}`,
        }}
        isConnectable={!isConnected}
      />
    );
  };

  const renderOutputHandles = () => {
    if (isStartNode) return null;
    return data?.outputs?.map((outputId: string, i: number) => {
      // const verticalPos = `${(i + 1) * (100 / (data?.outputs.length + 1))}%`;
      const isConnected = isAddNode ? true : isOutputHandleConnected(outputId);
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
                  zIndex: 10, // BELOW handle
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
            style={{
              background: style.color,
              transition: "all 0.3s ease-in-out",
            }}
            // onClick={handleClick}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = `${style.border}90`;
              el.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.borderColor = "(--wf-background-subtle)";
              el.style.transform = "scale(1)";
            }}
          >
            <WorkflowIcon
              nodeType={data.type}
              size={40}
              className="w-10 wf-node-icon"
            />
          </div>
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
                  <Check  />
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
            </div>
          )}
          {renderOutputHandles()}
          {!isAddNode && <div className="wf-node-name">{name}</div>}
        </div>

        {!isStartNode && (
          <div className="wf-node-toolbar" onClick={(e) => e.stopPropagation()}>
            <Button className="wf-btn--destructive" onClick={handleDeleteClick}>
              <Trash2 className="wf-node-toolbar-icon" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(CustomNode);
