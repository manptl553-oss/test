// import dagre from "dagre";
import { useFlowStore } from "@/core/store/useWorkflowStore";
import { NodeTypeProps } from "@/core/types/node.types";
import { getAutoLayoutedElements } from "@/core/utils/layout";
import { nodeTypeIcons } from "@/ui/icons/node-icons";
import { Fullscreen, Table2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  OnConnectStartParams,
  useReactFlow,
  useUpdateNodeInternals,
} from "reactflow";
import "reactflow/dist/style.css";
import { AddNodeButton } from "./AddNodeButton";
import CustomEdge from "./CustomEdge";
import CustomNode from "./CustomNode";
import NodeSidebar from "./NodeSidebar";

// ---------- MAIN COMPONENT ----------
const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

// Map workflow data
export function mapWorkflowToFlow(workflow: any, actions?: any) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  if (!workflow) return { nodes, edges };

  const xSpacing = 320;
  const ySpacing = 180;

  // Trigger node
  if (workflow.triggers?.length > 0) {
    const trigger = workflow.triggers[0];
    const icon = trigger.icon || nodeTypeIcons[trigger.type as NodeTypeProps];
    nodes.push({
      id: trigger.id,
      type: "custom",
      data: {
        id: trigger.id,
        name: trigger.name || "Event Trigger",
        type: trigger.type,
        icon,
        configuration: trigger.configuration,
        outputs: ["next"],
        backend_id: trigger.id, // ✅ store backend id
        ...actions,
      },
      position: { x: 100, y: 200 },
    });
  }

  // Workflow nodes
  workflow.nodes?.forEach((wfNode: any, index: number) => {
    const icon = wfNode.icon || nodeTypeIcons[wfNode.type as NodeTypeProps];
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
        outputs = ["next"];
        break;
    }

    nodes.push({
      id: wfNode.id,
      type: "custom",
      data: {
        id: wfNode.id,
        name: wfNode.name,
        type: wfNode.type,
        icon,
        configuration: wfNode.config,
        outputs,
        ...actions,
        backend_id: wfNode.id, // ✅ store backend id
      },
      position: {
        x: 400 + (index % 3) * xSpacing,
        y: 100 + Math.floor(index / 3) * ySpacing,
      },
    });
  });

  // Edges
  const seenEdgeIds = new Set<string>();
  workflow.edges?.forEach((e: any) => {
    const edgeId = e.id || `${e.source}-${e.target}-${e.condition || "next"}`;
    if (seenEdgeIds.has(edgeId)) return;
    seenEdgeIds.add(edgeId);

    edges.push({
      id: edgeId,
      source: e.source,
      target: e.target,
      sourceHandle: e.condition || "next",
      targetHandle: "input",
      type: "custom",
      animated: true,
      style: { strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
      label: e.condition || "",
      labelStyle: { fontWeight: 600, fontSize: 12 },
      data: e.data,
    });
  });

  // Auto-connect Trigger
  if (workflow.triggers?.length > 0 && workflow.nodes?.length > 0) {
    const triggerId = workflow.triggers[0].id;
    const existingTargets = new Set(workflow.edges?.map((e: any) => e.target));

    const firstNodes = workflow.nodes.filter(
      (n: any) => !existingTargets.has(n.id)
    );
    firstNodes.forEach((n: any) => {
      const edgeId = `edge-trigger-${n.id}`;
      if (!seenEdgeIds.has(edgeId)) {
        edges.push({
          id: edgeId,
          source: triggerId,
          target: n.id,
          type: "custom",
          animated: true,
          style: { strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
          label: "trigger",
          labelStyle: { fill: "#facc15", fontWeight: 600 },
        });
      }
    });
  }

  return { nodes, edges };
}

export default function FlowCanvas({ workflow }: any) {
  const {
    setNodes,
    setEdges,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSourceNodeId,
    setSourceHandleId,
    setShowSidebar,
    showSidebar,
    deleteNode,
    renameNode,
  } = useFlowStore();

  const { screenToFlowPosition, fitView } = useReactFlow();
  const [pendingConnection, setPendingConnection] = useState<any>(null);
  const [isLayouting, setIsLayouting] = useState(false);

  const isEditMode = !!workflow?.id;

  const handleDeleteClick = useCallback(
    (nodeId: string) => deleteNode(nodeId),
    [deleteNode]
  );

  const handleAddClick = useCallback(
    (nodeId: string, handleId: string) => {
      setSourceNodeId(nodeId);
      setSourceHandleId(handleId);
      setShowSidebar(true);
    },
    [setSourceNodeId, setSourceHandleId, setShowSidebar]
  );
  const updateNodeInternals = useUpdateNodeInternals();
  const { setUpdateNodeInternals } = useFlowStore();

  // hand the bridge to the store once
  useEffect(() => {
    setUpdateNodeInternals((id: string) => updateNodeInternals(id));
  }, [setUpdateNodeInternals, updateNodeInternals]);
  // Load workflow
  useEffect(() => {
    const { nodes, edges } = isEditMode
      ? mapWorkflowToFlow(workflow, {
          onAddClick: handleAddClick,
          onDeleteClick: handleDeleteClick,
          onRename: renameNode,
        })
      : { nodes: [], edges: [] };

    setNodes(nodes);
    setEdges(edges);
  }, [
    workflow,
    isEditMode,
    handleAddClick,
    handleDeleteClick,
    renameNode,
    setNodes,
    setEdges,
  ]);

  // Auto layout handler
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

  // Drag & drop logic
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const type = e.dataTransfer.getData("application/reactflow");
      const nodeType = e.dataTransfer.getData("nodeType");
      const nodeName = e.dataTransfer.getData("nodeName");

      if (!type && !nodeType) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `${type || nodeType}-${crypto.randomUUID()}`;

      const Icon = nodeTypeIcons[nodeType as NodeTypeProps] || Table2;

      const sourceNodeId = e.dataTransfer.getData("sourceNodeId");
      const sourceHandleId = e.dataTransfer.getData("sourceHandleId");
      const sourceEdgeId = e.dataTransfer.getData("sourceEdgeId");

      const newNode: Node = {
        id,
        type: "custom",
        position,
        data: {
          id,
          name: nodeName || type,
          type: nodeType,
          icon: Icon,
          onAddClick: handleAddClick,
          onDeleteClick: deleteNode,
          onRename: renameNode,
        },
      };

      const { addNode, addNodeAfter, addNodeBetweenEdge, clearSource } =
        useFlowStore.getState();

      if (sourceEdgeId && sourceNodeId) addNodeBetweenEdge(newNode);
      else if (sourceNodeId)
        addNodeAfter(newNode, sourceNodeId, sourceHandleId || "done");
      else addNode(newNode);

      clearSource?.();
      setShowSidebar(false);
    },
    [
      screenToFlowPosition,
      handleAddClick,
      deleteNode,
      renameNode,
      setShowSidebar,
    ]
  );

  // Nodes + Edges with dynamic data
  const nodesWithData = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isLoop: node.data.type === "loop",
          onAddClick: handleAddClick,
          onDeleteClick: handleDeleteClick,
          onRename: renameNode,
        },
      })),
    [nodes, handleAddClick, handleDeleteClick, renameNode]
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

  const onConnectStart = useCallback(
    (
      _event: React.MouseEvent | React.TouchEvent,
      params: OnConnectStartParams
    ) => {
      const { nodeId, handleId } = params;

      // check if this handle already has a connected edge
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
        setSourceNodeId(pendingConnection.nodeId);
        setSourceHandleId(pendingConnection.handleId);
        setShowSidebar(true);
      }

      setPendingConnection(null);
    },
    [
      pendingConnection,
      screenToFlowPosition,
      setSourceNodeId,
      setSourceHandleId,
      setShowSidebar,
    ]
  );

  return (
    <div className="w-full h-full relative bg-[var(--wf-background-base)] text-[var(--wf-text-default)]">
      {/* ReactFlow Canvas */}
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        className="bg-[var(--wf-background-base)]"
        // must be inline per ReactFlow API; still themeable via CSS var
        connectionLineStyle={{
          stroke: "var(--wf-border-default)",
          strokeWidth: 2,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <MiniMap
          nodeStrokeColor={() => "var(--wf-border-default)"}
          nodeColor={() => "var(--wf-background-subtle)"}
          maskColor="rgba(0,0,0,0.08)"
        />
        <Controls className="!bg-[var(--wf-background-subtle)] !text-[var(--wf-text-default)] !border !border-[var(--wf-border-default)]" />
        <Background color="var(--wf-border-default)" />
      </ReactFlow>

      {/* Auto Layout Button - bottom left */}
      <div className="absolute bottom-8 left-4 z-20">
        <button
          onClick={handleAutoLayout}
          aria-label="Auto layout"
          className="bg-[var(--wf-background-subtle)] text-[var(--wf-text-default)]
                 border border-[var(--wf-border-default)]
                 p-1 rounded-md shadow-xl w-8 h-8
                 flex items-center justify-center hover:opacity-90"
        >
          <Fullscreen className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <NodeSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Add Node Button */}
      {nodes.length === 0 && (
        <AddNodeButton onClick={() => setShowSidebar(true)} />
      )}
    </div>
  );
}
