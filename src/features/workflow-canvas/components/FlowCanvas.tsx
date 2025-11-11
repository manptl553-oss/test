import { Webhook, Clock, Calendar, Globe } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  Node,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from "./CustomEdge";
import CustomNode from "./CustomNode";
import { useFlowStore } from "@/store";
import { PopoverPanel } from "./Popover";

// ---------- TYPES ----------
interface PopoverItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<any>;
  color: string;
  secondaryIcons?: React.ComponentType<any>[];
}

interface PopoverConfig {
  title: string;
  items: PopoverItem[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  variant?: "trigger" | "action";
  onSelect?: (item: PopoverItem) => void;
}

// ---------- CONSTANTS ----------
const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

// ---------- TRIGGER MODULES ----------
const triggerModules: PopoverItem[] = [
  {
    id: "webhook",
    name: "Webhook",
    description: "Triggers workflow on external webhook event",
    icon: Webhook,
    color: "text-pink-600 bg-pink-100",
  },
  {
    id: "schedule",
    name: "Schedule",
    description: "Executes workflow at defined intervals or cron expressions",
    icon: Clock,
    color: "text-green-600 bg-green-100",
  },
  {
    id: "event",
    name: "Event",
    description: "Reacts to system or app-level events",
    icon: Calendar,
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    id: "http",
    name: "HTTP Request",
    description: "Triggers when a specific HTTP request is made",
    icon: Globe,
    color: "text-blue-600 bg-blue-100",
  },
];

// ---------- MAIN COMPONENT ----------
export default function FlowCanvas() {
  const {
    setNodes,
    setEdges,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    deleteNode,
  } = useFlowStore();

  const [popoverConfig, setPopoverConfig] = useState<PopoverConfig | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<{
    nodeId: string;
    position: { x: number; y: number };
  } | null>(null);

  const { getNode, getViewport } = useReactFlow();

  // ✅ Close popover handler
  const handleClosePopover = useCallback(() => {
    setPopoverConfig(null);
    setPopoverAnchor(null);
  }, []);

  // ✅ Toggle popover for Start Workflow node
const openTriggerPopover = useCallback(
  (nodeId: string) => {
    const node = getNode(nodeId);
    if (!node) return;

    // ✅ If popover is open for the same node → close (toggle)
    setPopoverAnchor((prevAnchor) => {
      if (prevAnchor?.nodeId === nodeId) {
        handleClosePopover();
        return null;
      }

      // ✅ Otherwise open new one
      const newAnchor = { nodeId, position: node.position };

      setPopoverConfig({
        title: "Select Trigger",
        items: triggerModules,
        showSearch: true,
        searchPlaceholder: "Search triggers",
        variant: "trigger",
        onSelect: (item) => {
          console.log("Selected trigger:", item);
          handleClosePopover();
        },
      });

      return newAnchor;
    });
  },
  [getNode, handleClosePopover]
);

  // ✅ Update popover anchor position when nodes move
  useEffect(() => {
    if (!popoverAnchor) return;
    const node = getNode(popoverAnchor.nodeId);
    if (!node) return;

    // Only update if position actually changed
    if (
      node.position.x !== popoverAnchor.position.x ||
      node.position.y !== popoverAnchor.position.y
    ) {
      setPopoverAnchor({
        nodeId: popoverAnchor.nodeId,
        position: node.position,
      });
    }
  }, [nodes, popoverAnchor, getNode]);

  // ✅ Initial Start Node
  useEffect(() => {
    if (nodes.length === 0) {
      const startNode: Node = {
        id: "start_workflow",
        type: "custom",
        position: { x: 200, y: 250 },
        data: {
          id: "start_workflow",
          name: "Start Workflow",
          type: "start_workflow",
          outputs: ["next"],
          onStartClick: (id: string) => openTriggerPopover(id),
        },
      };
      setNodes([startNode]);
    }
  }, [nodes, setNodes, openTriggerPopover]);

  // ✅ Pass popover state to nodes for visual feedback
  const nodesWithData = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDeleteClick: deleteNode,
          // Pass whether popover is open for this specific node
          isPopoverOpen: popoverAnchor?.nodeId === node.id && !!popoverConfig,
        },
      })),
    [nodes, deleteNode, popoverAnchor, popoverConfig]
  );

  const edgesWithData = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: "custom",
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
      })),
    [edges]
  );

  return (
    <div className="w-full h-full relative bg-white">
      <ReactFlow
        nodes={nodesWithData}
        edges={edgesWithData}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-white"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#eee" />
      </ReactFlow>

      {/* ✅ Sticky Popover */}
      {popoverConfig && popoverAnchor && (
        <PopoverPanel
          anchor={popoverAnchor}
          viewport={getViewport()}
          config={popoverConfig}
          onClose={handleClosePopover}
        />
      )}
    </div>
  );
}