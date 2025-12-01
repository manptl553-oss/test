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
  useUpdateNodeInternals,
  XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomEdge from "./CustomEdge";
import { Popover } from "./Popover";
import { v4 as uuidv4 } from "uuid";
import CustomNode from "./CustomNode";

export function mapWorkflowToFlow(workflow: any, actions?: any) {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  if (!workflow) return { nodes, edges };
  // Workflow nodes
  workflow.nodes?.forEach((wfNode: any, index: number) => {
    const icon =
      wfNode?.icon ?? nodeTypeStyles[wfNode.type as NodeTypeProps]?.icon;
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
          wfNode.config?.switchCases?.map((c: any) => c.condition) || [];
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
      sourceHandle: e.condition ?? "next",
      targetHandle: "input",
      type: "custom",
      animated: true,
      style: { strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
      label: e.condition ?? "",
      labelStyle: { fontWeight: 600, fontSize: 12 },
      data: { ...e.data, versionId: e?.versionId },
    });
  });
  return { nodes, edges };
}

// ---------- CONSTANTS ----------
const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

// ---------- MAIN COMPONENT ----------
export default function FlowCanvas({ workflow }: any) {
  const {
    setNodes,
    addNodeAfter,
    setEdges,
    nodes,
    edges,
    onNodesChange,
    onNodeDragStop,
    onNodeDrag,
    onEdgesChange,
    onConnect,
    deleteNode,
    renameNode,
    setActiveNode,
    activeNode,
    initializeFromBackend,
    currentVersion,
    setUpdateNodeInternals,
  } = useFlowStore();

  const updateNodeInternals = useUpdateNodeInternals();
  useEffect(() => {
    setUpdateNodeInternals(updateNodeInternals);
  }, [updateNodeInternals]);

  const isPopoverOpen = useMemo(
    () => ["start_workflow", "void_node"].includes(activeNode?.data?.type),
    [activeNode?.data?.type]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const { screenToFlowPosition, fitView } = useReactFlow();
  const [pendingConnection, setPendingConnection] = useState<any>(null);
  const [isLayouting, setIsLayouting] = useState(false);

  const isEditMode = !!workflow?.id;

  const handleDeleteClick = useCallback(
    (nodeId: string) => deleteNode(nodeId),
    [deleteNode]
  );

  const handleAddNode = useCallback(
    (nodeId: string, position: XYPosition, handleId: string) => {
      addNodeAfter(position, nodeId, handleId);
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
          versionId: currentVersion?.id ?? workflow.versionId,
          outputs: ["none"],
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
  ]);

  // Create stable node data object
  const nodeDataCallbacks = useMemo(
    () => ({
      onDeleteClick: handleDeleteClick,
      onAddClick: handleAddClick,
    }),
    [handleDeleteClick, handleAddClick]
  );

  const nodesWithData = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        ...nodeDataCallbacks,
      },
    }));
  }, [nodes, nodeDataCallbacks]);

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

   const onPaneClick = useCallback(() => {
    setActiveNode(null); // This clears the selected node, which makes isPopoverOpen false
  }, [setActiveNode]);

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
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick} 
        fitView
        className="wf-flow-surface"
        proOptions={{ hideAttribution: true }}
      >
        {/* <Background color="#eee" /> */}
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
