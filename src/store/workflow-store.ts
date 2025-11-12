import { create } from "zustand";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { computeConnectedHandles, makeEdge } from "@/shared/utils/edge";
import {
  getOutputsForNode,
  getSelfLoopHandle,
  getTargetHandleForNode,
  isTriggerNode,
} from "@/shared";

interface NodeData {
  backend_id: null;
  id: string;
  name: string;
  type: string;
  outputs?: string[];
  parentLoop?: string;
  config?: any;
  data?: any;
}

interface FlowState {
  nodes: Node<NodeData>[];
  edges: Edge[];

  sourceNodeId: string | null;
  sourceHandleId: string | null;
  sourceEdgeId: string | null;
  showSidebar: boolean;
  connectedHandles: Record<string, Set<string>>;
  workflowId: string | null;
  setWorkflowId: (id: string | null) => void;
  // React Flow API
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Core actions
  addEdge: (edge: Edge) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSourceNodeId: (id: string | null) => void;
  setSourceHandleId: (id: string | null) => void;
  setSourceEdgeId: (id: string | null) => void;
  setShowSidebar: (value: boolean) => void;

  // Node operations
  addNode: (node: Node, shouldConnect?: boolean) => void;
  addNodeAfter: (
    node: Node,
    sourceNodeId: string,
    sourceHandleId?: string
  ) => void;
  addNodeBetweenEdge: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (id: string, newName: string) => void;
  updateNode: (nodeId: string, nodeData: any) => void;

  // Utility
  setEdgeForSidebar: (edgeId: string, sourceNodeId: string) => void;
  clearSource: () => void;
  clearAll: () => void;

  // 🔁 bridge to RF's updateNodeInternals
  _updateNodeInternals?: (id: string) => void;
  setUpdateNodeInternals: (fn: (id: string) => void) => void;

  // public helpers
  refreshNodeHandles: (nodeId: string) => void;
  refreshManyHandles: (nodeIds: string[]) => void;

  activeModelId: string | null;
  setActiveModelId: (nodeId: string | null) => void;
}

//  Zustand Store
export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  sourceNodeId: null,
  sourceHandleId: null,
  sourceEdgeId: null,
  showSidebar: false,
  connectedHandles: {},
  workflowId: null,
  activeModelId: null,

  setActiveModelId: (id) => set({ activeModelId: id }),

  setWorkflowId: (id) => set({ workflowId: id }),

  _updateNodeInternals: undefined,
  setUpdateNodeInternals: (fn) => set({ _updateNodeInternals: fn }),

  refreshNodeHandles: (nodeId) => {
    const fn = get()._updateNodeInternals;
    if (!fn) return;
    // let ReactFlow commit state first, then recompute anchors
    requestAnimationFrame(() => fn(nodeId));
  },

  refreshManyHandles: (nodeIds) => {
    const fn = get()._updateNodeInternals;
    if (!fn) return;
    requestAnimationFrame(() => nodeIds.forEach((id) => fn(id)));
  },

  //  Basic Setters
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => {
    // Compute handle connections only if edge count changed
    const prevEdges = get().edges;
    const handleMap =
      prevEdges.length === edges.length
        ? get().connectedHandles
        : computeConnectedHandles(edges);
    set({ edges, connectedHandles: handleMap });
  },
  setSourceNodeId: (id) => set({ sourceNodeId: id }),
  setSourceHandleId: (id) => set({ sourceHandleId: id }),
  setSourceEdgeId: (id) => set({ sourceEdgeId: id }),
  setShowSidebar: (value) => set({ showSidebar: value }),

  //  Edge Operations
  addEdge: (edge) => {
    const { edges } = get();
    const newEdges = addEdge(edge, edges);
    set({
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  //  React Flow Handlers
  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes);
    if (nodes !== get().nodes) set({ nodes });
  },

  onEdgesChange: (changes) => {
    const prevEdges = get().edges;
    const updatedEdges = applyEdgeChanges(changes, prevEdges);
    const nodeIds = new Set(get().nodes.map((n) => n.id));

    //  Filter only valid edges (source/target exist)
    const cleanedEdges = updatedEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    if (cleanedEdges !== prevEdges) {
      set({
        edges: cleanedEdges,
        connectedHandles: computeConnectedHandles(cleanedEdges),
      });
    }
  },

  onConnect: (connection) => {
    const { edges, nodes } = get();

    // find the source node backend uuid
    const sourceNode = nodes.find((n) => n.id === connection.source);

    const newEdge = makeEdge({
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle ?? "done",
      targetHandle: connection.targetHandle ?? "input",
    });

    const newEdges = addEdge(newEdge, edges);

    set({
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  // Node Operations
  addNode: (node, shouldConnect = true) => {
    const { nodes, edges } = get();
    const newNode = {
      ...node,
      data: { ...node.data, outputs: getOutputsForNode(node) },
    };
    let newEdges = edges;

    const previousNode = nodes.at(-1);
    if (
      shouldConnect &&
      previousNode &&
      !isTriggerNode(newNode?.data?.type?.toLowerCase?.())
    ) {
      newEdges = addEdge(
        makeEdge({
          source: previousNode.id,
          target: newNode.id,
          sourceHandle: "done",
          targetHandle: getTargetHandleForNode(newNode),
        }),
        newEdges
      );
    }

    const loopHandle = getSelfLoopHandle(newNode);
    if (loopHandle) {
      queueMicrotask(() => {
        const { edges: curEdges } = get();
        const selfEdge = makeEdge({
          source: newNode.id,
          target: newNode.id,
          sourceHandle: loopHandle,
          targetHandle: getTargetHandleForNode(newNode),
        });
        const updatedEdges = addEdge(selfEdge, curEdges);
        set({
          edges: updatedEdges,
          connectedHandles: computeConnectedHandles(updatedEdges),
        });
      });
    }

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  // Other operations (same functionality, faster updates)
  addNodeAfter: (node, sourceNodeId, sourceHandleId = "done") => {
    const { nodes, edges } = get();

    const newNode = {
      ...node,
      data: {
        ...node.data,
        backend_id: null,
        outputs: getOutputsForNode(node),
      },
    };

    const sourceNode = nodes.find((n) => n.id === sourceNodeId);
    const prevNodeUUID = sourceNode?.data?.backend_id || null;

    const filteredEdges = edges.filter(
      (e) => !(e.source === sourceNodeId && e.sourceHandle === sourceHandleId)
    );

    const newEdges: Edge[] = [...filteredEdges];

    if (!isTriggerNode(node?.data?.type?.toLowerCase?.())) {
      newEdges.push(
        makeEdge({
          source: sourceNodeId,
          target: newNode.id,
          sourceHandle: sourceHandleId,
          targetHandle: getTargetHandleForNode(newNode),
          data: {
            prev_node_id: prevNodeUUID,
            prev_node_type: sourceNode?.data?.type,
          },
        })
      );
    }

    newNode.data.prev_node_id = prevNodeUUID;

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  addNodeBetweenEdge: (node) => {
    const { nodes, edges, sourceEdgeId } = get();
    if (!sourceEdgeId) return;

    const edge = edges.find((e) => e.id === sourceEdgeId);
    if (!edge) return;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const newNode = { ...node };
    newNode.data.outputs = getOutputsForNode(newNode);

    // Extract metadata
    const prevId = sourceNode?.data?.backend_id ?? null;
    const prevType = sourceNode?.data?.type ?? null;
    const nextId = targetNode?.data?.backend_id ?? null;
    const nextType = targetNode?.data?.type ?? null;

    // Store meta on new node
    newNode.data.prev_node_id = prevId;
    newNode.data.prev_node_type = prevType;
    newNode.data.next_node_id = nextId;
    newNode.data.next_node_type = nextType;

    let newEdges = edges.filter((e) => e.id !== sourceEdgeId);

    // If new node is a trigger, do not attach
    if (isTriggerNode(node?.data?.type?.toLowerCase?.())) {
      set({
        nodes: [...nodes, newNode],
        edges: newEdges,
        sourceEdgeId: null,
        showSidebar: false,
      });
      return;
    }

    // New edges with metadata
    const edgeToNew = makeEdge({
      source: sourceNode.id,
      target: newNode.id,
      sourceHandle: edge.sourceHandle ?? "done",
      targetHandle: getTargetHandleForNode(newNode),
      data: {
        prev_node_id: prevId,
        prev_node_type: prevType,
        next_node_id: newNode.data.backend_id ?? null,
        next_node_type: newNode.data.type,
      },
    });

    const edgeFromNew = makeEdge({
      source: newNode.id,
      target: targetNode.id,
      sourceHandle: getOutputsForNode(newNode)[0],
      targetHandle: edge.targetHandle ?? "input",
      data: {
        prev_node_id: newNode.data.backend_id ?? null,
        prev_node_type: newNode.data.type,
        next_node_id: nextId,
        next_node_type: nextType,
      },
    });

    newEdges.push(edgeToNew, edgeFromNew);

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
      sourceEdgeId: null,
      showSidebar: false,
    });
  },

  //  Node Utilities
  renameNode: (nodeId, newName) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, name: newName } }
          : node
      ),
    })),

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();

    //  Identify node type
    const deletedNode = nodes.find((n) => n.id === nodeId);
    const isLoop = deletedNode?.data?.type === "loop";

    // Gather related edges
    const incoming = edges.filter((e) => e.target === nodeId);
    const outgoing = edges.filter((e) => e.source === nodeId);

    //  Remove all edges connected to this node
    let updatedEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );

    //  Special handling for loop nodes
    if (isLoop) {
      const childNodes = nodes.filter((n) => n.parentNode === nodeId);
      const childIds = new Set(childNodes.map((n) => n.id));

      //  Remove all edges between loop ↔ its children or self
      updatedEdges = updatedEdges.filter(
        (e) => !(e.source === nodeId || e.target === nodeId)
      );
      updatedEdges = updatedEdges.filter(
        (e) => !(childIds.has(e.source) && e.target === nodeId)
      );
    } else {
      //  For normal nodes, reconnect previous → next
      if (incoming.length > 0 && outgoing.length > 0) {
        const reconnectedEdges = incoming.map((inEdge) => {
          const outEdge = outgoing[0]; // only one forward connection
          return makeEdge({
            source: inEdge.source,
            target: outEdge.target,
            sourceHandle: inEdge.sourceHandle ?? "done",
            targetHandle: outEdge.targetHandle ?? "input",
          });
        });

        updatedEdges = [...updatedEdges, ...reconnectedEdges];
      }
    }

    //  Remove the deleted node
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);

    //  Clean invalid edges (source/target missing)
    const validNodeIds = new Set(updatedNodes.map((n) => n.id));
    const cleanedEdges = updatedEdges.filter(
      (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
    );

    //  Final state update
    set({
      nodes: updatedNodes,
      edges: cleanedEdges,
      connectedHandles: computeConnectedHandles(cleanedEdges, updatedNodes),
    });
  },

  updateNode: (nodeId, nodeData) =>
    set((state) => {
      const oldNode = state.nodes.find((n) => n.id === nodeId);
      if (!oldNode) return state;

      const tempNode = {
        ...oldNode,
        data: {
          ...oldNode.data,
          ...nodeData,
        },
      };

      const newOutputs = getOutputsForNode(tempNode);
      const normalizedNew = newOutputs.map((o: string) => o.toLowerCase());

      const updatedNode = {
        ...tempNode,
        data: {
          ...tempNode.data,
          outputs: newOutputs,
        },
      };

      // ✅ Remove edges referencing removed handles
      const cleanedEdges = state.edges.filter((edge) => {
        if (edge.source !== nodeId) return true;
        const handle = edge.sourceHandle?.toLowerCase();
        if (!handle) return true; // single-output nodes
        return normalizedNew.includes(handle);
      });

      return {
        nodes: state.nodes.map((n) => (n.id === nodeId ? updatedNode : n)),
        edges: cleanedEdges,
        connectedHandles: computeConnectedHandles(cleanedEdges),
      };
    }),

  //  Misc Utilities
  setEdgeForSidebar: (edgeId, sourceNodeId) =>
    set({ sourceEdgeId: edgeId, sourceNodeId, showSidebar: true }),

  clearSource: () =>
    set({ sourceNodeId: null, sourceHandleId: null, sourceEdgeId: null }),
  clearAll: () => set({ nodes: [], edges: [], connectedHandles: {} }),
}));
