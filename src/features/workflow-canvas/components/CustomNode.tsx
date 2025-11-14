import { Button, isTriggerNode } from "@/shared";
import { useFlowStore } from "@/store";
import { Plus, PlusIcon, Trash2 } from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Handle,
  NodeProps,
  Position,
  useReactFlow,
  useStore,
  useStoreApi,
} from "reactflow";
import { NodeConfigModal } from "./NodeConfigModal";

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

//  OPTIMIZATION 1: Memoize individual handle components
const InputHandle = memo(({ id, style }: { id: string; style?: React.CSSProperties }) => (
  <Handle
    type="target"
    position={Position.Left}
    id={id}
    className="!top-12 !left-1 !w-4 !h-7 !bg-green-500 !rounded-l-full !border-none"
    style={style}
  />
));
InputHandle.displayName = "InputHandle";

const MergeInputHandle = memo(({ index }: { index: number }) => (
  <div
    className="absolute flex items-center gap-1"
    style={{
      left: 0,
      top: `${(index + 1) * 20}%`,
      transform: "translateY(-50%)",
    }}
  >
    <span className="text-xs text-gray-500">{`Input ${index + 1}`}</span>
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        id={`input-${index + 1}`}
        className="!w-6 !h-6 !bg-gray-400 !rounded-l-full !border-none"
      />
    </div>
  </div>
));
MergeInputHandle.displayName = "MergeInputHandle";

//  OPTIMIZATION 2: Memoize output handle component
interface OutputHandleProps {
  outputId: string;
  isConnected: boolean;
  label?: string;
  onHandleClick: (e: React.MouseEvent) => void;
}

const OutputHandle = memo(({ outputId, isConnected, label, onHandleClick }: OutputHandleProps) => (
  <div className="absolute right-2 !top-2/6 flex items-center z-0">
    {label && <div className="text-xs font-semibold pr-4">{label}</div>}
    <div className="relative">
      <Handle
        type="source"
        position={Position.Right}
        id={outputId}
        isConnectable={!isConnected}
        className="!w-7 !h-8 !top-1 !bg-green-500 !rounded-r-full !border-2 border-white !m-0 flex items-center justify-center cursor-pointer"
        style={{
          top: "50%",
          right: -8,
          transform: "translateY(-50%)",
          pointerEvents: "all",
        }}
        onClick={onHandleClick}
      />
      {!isConnected && (
        <div className="!top-[3px] absolute inset-0 !-left-0 flex items-center justify-center text-white text-xs font-light pointer-events-none">
          +
        </div>
      )}
    </div>
  </div>
));
OutputHandle.displayName = "OutputHandle";

const CustomNode = ({ data, id }: NodeProps) => {
  const { project } = useReactFlow();
  const [showConfig, setShowConfig] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const store = useStoreApi();
  
  //  OPTIMIZATION 3: Only select edges once and memoize
  const edges = useStore(
    useCallback((s) => s.edges, []),
    (a, b) => a === b // Shallow comparison
  );

  const Icon = data.icon || PlusIcon;
  const isStartNode = (data as any).type === "start_workflow";
  const isAddNode = (data as any).type === "addNode";
  const name = data?.name || "start workflow";

  const { activeNode, setActiveNode } = useFlowStore();
  const open = activeNode?.id === id;
  const isNodeConfigModelOpen = !isStartNode && !isAddNode && activeNode?.id === id;

  // OPTIMIZATION 4: Memoize all event handlers
  const handleClick = useCallback(() => {
    setActiveNode(open ? null : data);
  }, [open, data, setActiveNode]);

  const handleDeleteClick = useCallback(async () => {
    try {
      const backendId = (data as any)?.backend_id as string | undefined;
      (data as any).onDeleteClick?.(id);
    } catch (e) {
      console.error("Failed to delete node", e);
    }
  }, [data, id]);

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

  // OPTIMIZATION 5: Memoize handle connection check
  const isHandleConnected = useCallback(
    (outputId: string) => {
      const output = normalizeHandle(outputId);
      const nodeOutputs = (data as any).outputs?.map(normalizeHandle) || [];
      const hasSingleOutput = nodeOutputs.length === 1;
      
      return edges.some((edge) => {
        if (edge.source !== id) return false;
        const handle = normalizeHandle(edge.sourceHandle);
        if (areHandlesEquivalent(handle, output)) return true;
        if (hasSingleOutput && (!edge.sourceHandle || handle === "done")) return true;
        if (handle.startsWith("case_") && output.startsWith("case_")) return handle === output;
        
        const isLoopNode = (data as any).name?.toLowerCase()?.includes("loop");
        if (isLoopNode) {
          return (handle === "body" && output === "body") || (handle === "done" && output === "done");
        }
        return false;
      });
    },
    [edges, id, data]
  );

  // ✅ OPTIMIZATION 6: Memoize input handles
  const inputHandles = useMemo(() => {
    if (isStartNode || isTriggerNode(data?.type)) return null;

    if ((data as any).name?.toLowerCase() === "merge") {
      return Array.from({ length: 4 }).map((_, i) => (
        <MergeInputHandle key={`input-${i + 1}`} index={i} />
      ));
    }

    return <InputHandle id="input" style={{ top: "50%" }} />;
  }, [isStartNode, data?.type, data?.name]);

  // ✅ OPTIMIZATION 7: Memoize output handles with stable callbacks
  const outputHandles = useMemo(() => {
    if (isStartNode) return null;
    
    return (data as any).outputs?.map((outputId: string) => {
      const isConnected = isHandleConnected(outputId);
      const handleIdForAdd = outputId === "done" ? "next" : outputId;
      const label = getLabel(outputId);

      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isConnected) return;
        const { clientX, clientY } = e;
        const position = project({ x: clientX, y: clientY });
        (data as any).onAddClick?.(id, position, handleIdForAdd);
      };

      return (
        <OutputHandle
          key={outputId}
          outputId={outputId}
          isConnected={isConnected}
          label={label}
          onHandleClick={handleClick}
        />
      );
    });
  }, [isStartNode, data, isHandleConnected, project, id]);

  return (
    <>
      <div
        className="relative group space-y-4 text-center"
        ref={nodeRef}
        onClick={() => {
          if (!closedModel.includes((data as any)?.type)) setShowConfig(true);
        }}
      >
        <div className="w-30 h-30 mx-auto relative space-y-3">
          {inputHandles}
          <div
            className="w-24 mx-auto h-24 ease-in-out border-4 border-white z-10 relative rounded-full transition-all duration-300 hover:scale-105 hover:border-red-400 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#c82344]"
            onClick={handleClick}
          >
            <Icon className="w-12 h-12" />
          </div>
          {outputHandles}
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
      {isNodeConfigModelOpen && (
        <NodeConfigModal
          open={showConfig}
          onOpenChange={setShowConfig}
          nodeId={id}
          nodeData={data}
        />
      )}
    </>
  );
};

//  OPTIMIZATION 8: Custom comparison for memo
const arePropsEqual = (prevProps: NodeProps, nextProps: NodeProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.data === nextProps.data &&
    prevProps.selected === nextProps.selected &&
    prevProps.dragging === nextProps.dragging
  );
};

export default memo(CustomNode, arePropsEqual);