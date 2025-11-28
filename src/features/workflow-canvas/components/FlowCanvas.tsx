import { Calendar, Clock, Globe, Webhook } from "lucide-react";
// import dagre from "dagre";
import { NodeTypeProps, nodeTypeStyles } from "@/shared";
import { getAutoLayoutedElements } from "@/shared/utils/layout";
import { NodeData, useFlowStore } from "@/store";
import { Fullscreen } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Edge,
  MarkerType,
  Node,
  OnConnectStartParams,
  useReactFlow,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from "./CustomEdge";
import CustomNode from "./CustomNode";
import { Popover } from "./Popover";
import { v4 as uuidv4 } from "uuid";

// ---------- TYPES ----------
interface PopoverItem {
  id: string;
  name: string;
  description?: string;
  icon: React.ComponentType<any>;
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

export function mapWorkflowToFlow(workflow: any, actions?: any) {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  if (!workflow) return { nodes, edges };
  // Workflow nodes
  workflow.nodes?.forEach((wfNode: any, index: number) => {
    const icon =
      wfNode.icon || nodeTypeStyles[wfNode.type as NodeTypeProps].icon;
    let outputs: string[] = [];

    switch (wfNode.type) {
      case "conditional":
        outputs = ["on_true", "on_false"];
        break;
      case "rule_executor":
        outputs = ["on_true", "on_false"];
        break;
      case "switch":
        outputs =
          wfNode.config?.switch_cases?.map((c: any) => c.condition) || [];
        break;
      case "loop":
        outputs = ["next"];
        break;
      default:
        outputs = ["none"];
        break;
    }

    nodes.push({
      id: wfNode.id,
      type: "custom",
      data: {
        id: wfNode.id,
        versionId: wfNode?.versionId,
        templateId: wfNode.templateId,
        name: wfNode.name,
        type: wfNode.type,
        icon,
        configuration: wfNode.config,
        outputs,
        ...actions,
      },
      position: wfNode.position,
    });
  });

  // Edges
  const seenEdgeIds = new Set<string>();
  workflow.edges?.forEach((e: any) => {
    const edgeId = e.id;
    if (seenEdgeIds.has(edgeId)) return;
    seenEdgeIds.add(edgeId);

    edges.push({
      id: edgeId,
      source: e.sourceId,
      target: e.targetId,
      sourceHandle: e.condition || "next",
      targetHandle: "input",
      type: "custom",
      animated: true,
      style: { strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
      label: e.condition || "",
      labelStyle: { fontWeight: 600, fontSize: 12 },
      data: { ...e.data, versionId: e?.versionId },
    });
  });

  // // Auto-connect Trigger
  // if (workflow.triggers?.length > 0 && workflow.nodes?.length > 0) {
  //   const triggerId = workflow.triggers[0].id;
  //   const existingTargets = new Set(workflow.edges?.map((e: any) => e.target));

  //   const firstNodes = workflow.nodes.filter(
  //     (n: any) => !existingTargets.has(n.id)
  //   );
  //   firstNodes.forEach((n: any) => {
  //     const edgeId = n.id;
  //     if (!seenEdgeIds.has(edgeId)) {
  //       edges.push({
  //         id: edgeId,
  //         source: triggerId,
  //         target: n.id,
  //         type: "custom",
  //         animated: true,
  //         style: { strokeWidth: 2 },
  //         markerEnd: { type: MarkerType.ArrowClosed },
  //         label: "trigger",
  //         labelStyle: { fill: "#facc15", fontWeight: 600 },
  //         data: { versionId: n.versionId },
  //       });
  //     }
  //   });
  // }

  return { nodes, edges };
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
  },
  {
    id: "schedule",
    name: "Schedule",
    description: "Executes workflow at defined intervals or cron expressions",
    icon: Clock,
  },
  {
    id: "event",
    name: "Event",
    description: "Reacts to system or app-level events",
    icon: Calendar,
  },
  {
    id: "http",
    name: "HTTP Request",
    description: "Triggers when a specific HTTP request is made",
    icon: Globe,
  },
];

// ---------- MAIN COMPONENT ----------
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function FlowCanvas({ workflow }: any) {
  const {
    setNodes,
    addNodeAfter,
    setEdges,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    deleteNode,
    renameNode,
    setActiveNode,
    activeNode,
    initializeFromBackend,
    versionId,
  } = useFlowStore();

  const isPopoverOpen = useMemo(
    () => ["start_workflow", "addNode"].includes(activeNode?.data?.type),
    [activeNode?.data?.type] // ✅ More specific dependency
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverConfig, setPopoverConfig] = useState<PopoverConfig | null>(
    null
  );
  const [popoverAnchor, setPopoverAnchor] = useState<{
    nodeId: string;
    position: { x: number; y: number };
  } | null>(null);

  const { screenToFlowPosition, fitView, getNode } = useReactFlow();
  const [pendingConnection, setPendingConnection] = useState<any>(null);
  const [isLayouting, setIsLayouting] = useState(false);

  const isEditMode = !!workflow?.id;

  // ✅ OPTIMIZATION 2: Memoize all callbacks properly
  const handleDeleteClick = useCallback(
    (nodeId: string) => deleteNode(nodeId),
    [deleteNode]
  );

  const handleAddNode = useCallback(
    (nodeId: string, position: XYPosition, handleId: string) => {
      const id = uuidv4();
      const newNode = {
        id,
        type: "custom",
        position,
        data: {
          id,
          type: "addNode",
          onAddClick: handleAddClick,
          onDeleteClick: deleteNode,
          onRename: renameNode,
        },
      };
      addNodeAfter(newNode, nodeId, handleId);
      (newNode);
    },
    [addNodeAfter, deleteNode, renameNode, setActiveNode]
  );

  const handleAddClick = useCallback(
    (nodeId: string, position: XYPosition, handleId: string) => {
      handleAddNode(nodeId, position, handleId);
    },
    [handleAddNode]
  );

  // Load workflow
  useEffect(() => {
    const { nodes, edges } = isEditMode
      ? mapWorkflowToFlow(workflow, {
          onAddClick: handleAddClick,
          onDeleteClick: handleDeleteClick,
          onRename: renameNode,
        })
      : { nodes: [], edges: [] };
    initializeFromBackend({ nodes, edges });
  }, [
    workflow,
    isEditMode,
    handleAddClick,
    handleDeleteClick,
    renameNode,
    setNodes,
    setEdges,
  ]);

  const handleClosePopover = useCallback(() => {
    setPopoverConfig(null);
    setPopoverAnchor(null);
  }, []);

  const openTriggerPopover = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (!node) return;

      setPopoverAnchor((prevAnchor) => {
        if (prevAnchor?.nodeId === nodeId) {
          handleClosePopover();
          return null;
        }

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

  //  OPTIMIZATION 3: Debounce popover position updates during drag
  const debouncedNodes = useDebounce(nodes, 100); // Only update every 100ms

  useEffect(() => {
    if (!popoverAnchor) return;
    const node = getNode(popoverAnchor.nodeId);
    if (!node) return;

    if (
      node.position.x !== popoverAnchor.position.x ||
      node.position.y !== popoverAnchor.position.y
    ) {
      popoverAnchor;
      setPopoverAnchor({
        nodeId: popoverAnchor.nodeId,
        position: node.position,
      });
    }
  }, [debouncedNodes, popoverAnchor, getNode]); // Use debounced nodes

  // Initial Start Node
  useEffect(() => {
    const isWorkflowEmpty =
      isEditMode && (workflow?.nodes?.length ?? 0) === 0 && nodes.length === 0;

    const id = uuidv4();
    if (isWorkflowEmpty) {
      const startNode: Node = {
        id: id,
        type: "custom",
        position: { x: 200, y: 250 },
        data: {
          id: id,
          name: "Start Workflow",
          type: "start_workflow",
          versionId: versionId ?? workflow.versionId,
          outputs: ["none"],
          onStartClick: (id: string) => openTriggerPopover(id),
        },
      };
      setNodes([startNode]);
    }
  }, [
    nodes.length,
    isEditMode,
    workflow?.triggers?.length,
    workflow?.nodes?.length,
    setNodes,
    openTriggerPopover,
  ]);

  //  OPTIMIZATION 4: Create stable node data object
  const nodeDataCallbacks = useMemo(
    () => ({
      onDeleteClick: handleDeleteClick,
      onAddClick: handleAddClick,
    }),
    [handleDeleteClick, handleAddClick]
  );

  const nodesWithData = useMemo(() => {
    const popoverNodeId = popoverAnchor?.nodeId;
    const hasConfig = !!popoverConfig;

    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        ...nodeDataCallbacks,
        isPopoverOpen: popoverNodeId === node.id && hasConfig,
      },
    }));
  }, [nodes, popoverAnchor?.nodeId, popoverConfig, nodeDataCallbacks]);

  const edgesWithData = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: "custom",
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
      })),
    [edges]
  );

  const onConnectStart = useCallback(
    (
      _event: React.MouseEvent | React.TouchEvent,
      params: OnConnectStartParams
    ) => {
      const { nodeId, handleId } = params;

      const isConnected = edges.some(
        (e) => e.source === nodeId && e.sourceHandle === handleId
      );

      if (isConnected) {
        alert("This node is already connected to the next step.");
        return;
      }

      setPendingConnection(params);
    },
    [edges]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (
        pendingConnection &&
        (event.target as HTMLElement).classList.contains("react-flow__pane")
      ) {
        const x = "clientX" in event ? event.clientX : event.touches[0].clientX;
        const y = "clientY" in event ? event.clientY : event.touches[0].clientY;
        const position = screenToFlowPosition({ x, y });
        handleAddNode(
          pendingConnection.nodeId,
          position,
          pendingConnection.handleId
        );
      }
      setPendingConnection(null);
    },
    [pendingConnection, screenToFlowPosition, handleAddNode]
  );

  const handleAutoLayout = useCallback(() => {
    setIsLayouting(true);
    setTimeout(() => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getAutoLayoutedElements(nodes, edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      fitView({ padding: 0.2 });
      setIsLayouting(false);
    }, 100);
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleNodeClick = useCallback(
    (_: any, node: Node) => {
      setActiveNode(activeNode ? null : node);
    },
    [activeNode, setActiveNode]
  );

  return (
    <div className="wf-flow-root" ref={containerRef}>
      <ReactFlow
        nodes={nodesWithData}
        edges={edgesWithData}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={handleNodeClick}
        fitView
        className="wf-flow-surface"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#eee" />
      </ReactFlow>

      {isPopoverOpen && <Popover />}

      <div className="wf-autolayout-wrapper">
        <button
          onClick={handleAutoLayout}
          aria-label="Auto layout"
          className="wf-autolayout-btn"
        >
          <Fullscreen className="wf-icon-sm" />
        </button>
      </div>
    </div>
  );
}
