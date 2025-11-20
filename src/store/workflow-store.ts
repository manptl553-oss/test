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
  NodeTypeProps,
} from "@/shared";
import {
  transformEdge,
  transformNode,
} from "@/features/workflow-canvas/helpers/normalize";
import { v4 as uuidv4 } from "uuid";

export interface NodeData {
  id: string;
  name: string;
  type: string;
  versionId: string | null;
  description?: string;
  outputs?: string[];
  parentLoop?: string;
  templateId?: string;
  configuration?: any;
  data?: any;
  parent?: any;
}

interface WorkflowDiff {
  nodes: Node<NodeData>[];
  deletedNodes: string[];
  edges: Edge[];
  deletedEdges: string[];
}

interface FlowState {
  nodes: Node<NodeData>[];
  edges: Edge[];

  // Track what exists in backend
  syncedNodeIds: Set<string>;
  syncedEdgeIds: Set<string>;

  // Track changes
  dirtyNodeIds: Set<string>;
  dirtyEdgeIds: Set<string>;
  deletedNodeIds: Set<string>;
  deletedEdgeIds: Set<string>;

  sourceNodeId: string | null;
  sourceHandleId: string | null;
  sourceEdgeId: string | null;
  showSidebar: boolean;
  connectedHandles: Record<string, Set<string>>;
  workflowId: string | null;
  versionId: string | null;
  activeNode: Node | null;

  // Initialize from backend
  initializeFromBackend: (workflow: {
    nodes: Node<NodeData>[];
    edges: Edge[];
  }) => void;

  // Get changes for sync
  getChangesForSync: () => WorkflowDiff | null;

  // After successful sync
  markAsSynced: () => void;

  // Check if there are unsaved changes
  isDirty: () => boolean;

  setActiveNode: (node: Node | null) => void;
  setWorkflowId: (id: string | null) => void;
  setVersionId: (id: string | null) => void;

  // React Flow API
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Core actions
  addEdge: (edge: Edge) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  deleteEdge: (edgeId: string) => void;
  setSourceNodeId: (id: string | null) => void;
  setSourceHandleId: (id: string | null) => void;
  setSourceEdgeId: (id: string | null) => void;
  setShowSidebar: (value: boolean) => void;

  // Node operations
  // addNode: (node: Node, shouldConnect?: boolean) => void;
  addNodeAfter: (
    node: Node,
    sourceNodeId: string,
    sourceHandleId?: string
  ) => void;
  addNodeBetweenEdge: (node: Node, edge: Edge) => void;
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
}

//  Zustand Store with Dirty Tracking
export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  // Sync tracking
  syncedNodeIds: new Set(),
  syncedEdgeIds: new Set(),

  // Change tracking
  dirtyNodeIds: new Set(),
  dirtyEdgeIds: new Set(),
  deletedNodeIds: new Set(),
  deletedEdgeIds: new Set(),

  sourceNodeId: null,
  sourceHandleId: null,
  sourceEdgeId: null,
  showSidebar: false,
  connectedHandles: {},
  workflowId: null,
  versionId: null,
  activeNode: null,

  // Initialize workflow from backend
  initializeFromBackend: (workflow) => {
    set({
      nodes: workflow.nodes,
      edges: workflow.edges,
      syncedNodeIds: new Set(workflow.nodes.map((n) => n.id)),
      syncedEdgeIds: new Set(workflow.edges.map((e) => e.id)),
      // Clear all tracking
      dirtyNodeIds: new Set(),
      dirtyEdgeIds: new Set(),
      deletedNodeIds: new Set(),
      deletedEdgeIds: new Set(),
      connectedHandles: computeConnectedHandles(workflow.edges),
    });
  },

  // Get changes for API sync
  getChangesForSync: () => {
    const state = get();

    // Quick check: any changes?
    if (
      state.dirtyNodeIds.size === 0 &&
      state.deletedNodeIds.size === 0 &&
      state.dirtyEdgeIds.size === 0 &&
      state.deletedEdgeIds.size === 0 &&
      state.nodes.every((n) => state.syncedNodeIds.has(n.id)) &&
      state.edges.every((e) => state.syncedEdgeIds.has(e.id))
    ) {
      return null; // No changes
    }

    // New nodes = nodes not in syncedNodeIds
    const addedNodes = state.nodes.filter(
      (n) => !state.syncedNodeIds.has(n.id)
    );

    // Updated nodes = nodes in dirtyNodeIds
    const updatedNodes = state.nodes.filter((n) =>
      state.dirtyNodeIds.has(n.id)
    );

    // Deleted nodes = IDs in deletedNodeIds
    const deletedNodes = Array.from(state.deletedNodeIds);

    // Same for edges
    const addedEdges = state.edges.filter(
      (e) => !state.syncedEdgeIds.has(e.id)
    );
    const updatedEdges = state.edges.filter((e) =>
      state.dirtyEdgeIds.has(e.id)
    );
    const deletedEdges = Array.from(state.deletedEdgeIds);

    const nodes = [...addedNodes, ...updatedNodes].map(transformNode);
    const edges = [...addedEdges, ...updatedEdges].map(transformEdge);
    return {
      nodes,
      edges,
      deletedNodes,
      deletedEdges,
    };
  },

  // Mark everything as synced after successful save
  markAsSynced: () => {
    set((state) => {
      // Add all current nodes/edges to synced sets
      const newSyncedNodeIds = new Set(state.nodes.map((n) => n.id));
      const newSyncedEdgeIds = new Set(state.edges.map((e) => e.id));

      return {
        syncedNodeIds: newSyncedNodeIds,
        syncedEdgeIds: newSyncedEdgeIds,
        // Clear all tracking
        dirtyNodeIds: new Set(),
        dirtyEdgeIds: new Set(),
        deletedNodeIds: new Set(),
        deletedEdgeIds: new Set(),
      };
    });
  },

  // Check if there are unsaved changes
  isDirty: () => {
    const state = get();
    return (
      state.dirtyNodeIds.size > 0 ||
      state.deletedNodeIds.size > 0 ||
      state.dirtyEdgeIds.size > 0 ||
      state.deletedEdgeIds.size > 0 ||
      state.nodes.some((n) => !state.syncedNodeIds.has(n.id)) ||
      state.edges.some((e) => !state.syncedEdgeIds.has(e.id))
    );
  },

  setActiveNode: (node) => set({ activeNode: node }),
  setWorkflowId: (id) => set({ workflowId: id }),
  setVersionId: (id) => set({ versionId: id }),

  _updateNodeInternals: undefined,
  setUpdateNodeInternals: (fn) => set({ _updateNodeInternals: fn }),

  refreshNodeHandles: (nodeId) => {
    const fn = get()._updateNodeInternals;
    if (!fn) return;
    requestAnimationFrame(() => fn(nodeId));
  },

  refreshManyHandles: (nodeIds) => {
    const fn = get()._updateNodeInternals;
    if (!fn) return;
    requestAnimationFrame(() => nodeIds.forEach((id) => fn(id)));
  },

  // Basic Setters
  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => {
    console.log("set edges ", edges);
    const prevEdges = get().edges;
    const handleMap =
      prevEdges.length === edges.length
        ? get().connectedHandles
        : computeConnectedHandles(edges);
    set({ edges, connectedHandles: handleMap });
  },

  deleteEdge: (edgeId: string) =>
    set((state) => {
      const { edges, syncedEdgeIds, deletedEdgeIds, dirtyEdgeIds } = state;

      const newDeletedEdgeIds = new Set(deletedEdgeIds);
      const newDirtyEdgeIds = new Set(dirtyEdgeIds);

      // Track deletion if edge was synced
      if (syncedEdgeIds.has(edgeId)) {
        newDeletedEdgeIds.add(edgeId);
        newDirtyEdgeIds.delete(edgeId);
      } else if (dirtyEdgeIds.has(edgeId)) {
        newDirtyEdgeIds.delete(edgeId);
      }

      // Remove edge
      const newEdges = edges.filter((e) => e.id !== edgeId);

      return {
        ...state,
        edges: newEdges,
        connectedHandles: computeConnectedHandles(newEdges),
        deletedEdgeIds: newDeletedEdgeIds,
        dirtyEdgeIds: newDirtyEdgeIds,
      };
    }),

  setSourceNodeId: (id) => set({ sourceNodeId: id }),
  setSourceHandleId: (id) => set({ sourceHandleId: id }),
  setSourceEdgeId: (id) => set({ sourceEdgeId: id }),
  setShowSidebar: (value) => set({ showSidebar: value }),

  // Edge Operations
  addEdge: (edge) => {
    const { edges, versionId } = get();
    const newEdges = addEdge(
      { ...edge, data: { ...edge.data, versionId: versionId } },
      edges
    );

    // Don't mark as dirty - it's a new edge
    // Will be picked up by getChangesForSync as addedEdge

    set({
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  // React Flow Handlers
  onNodesChange: (changes) => {
    const state = get();
    const nodes = applyNodeChanges(changes, state.nodes);

    if (nodes !== state.nodes) {
      const dirtyNodeIds = new Set(state.dirtyNodeIds);

      changes.forEach((change) => {
        if (change.type === "position" && state.syncedNodeIds.has(change.id)) {
          // find previous node position
          const prev = state.nodes.find((n) => n.id === change.id);
          // change.position may be present on the change object
          const newPos = (change as any).position;
          if (prev && newPos) {
            const moved =
              prev.position?.x !== newPos.x || prev.position?.y !== newPos.y;
            if (moved) dirtyNodeIds.add(change.id);
          }
        }
      });

      set({ nodes, dirtyNodeIds });
    }
  },

  onEdgesChange: (changes) => {
    const state = get();
    const prevEdges = state.edges;
    const updatedEdges = applyEdgeChanges(changes, prevEdges);
    const nodeIds = new Set(state.nodes.map((n) => n.id));

    const cleanedEdges = updatedEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    const newDeletedEdgeIds = new Set(state.deletedEdgeIds);
    const newDirtyEdgeIds = new Set(state.dirtyEdgeIds);

    changes.forEach((change) => {
      if (change.type === "remove" && state.syncedEdgeIds.has(change.id)) {
        newDeletedEdgeIds.add(change.id);
        newDirtyEdgeIds.delete(change.id);
      }
    });

    if (cleanedEdges !== prevEdges) {
      set({
        edges: cleanedEdges,
        connectedHandles: computeConnectedHandles(cleanedEdges),
        deletedEdgeIds: newDeletedEdgeIds,
        dirtyEdgeIds: newDirtyEdgeIds,
      });
    }
  },

  onConnect: (connection) => {
    const { edges, versionId } = get();

    const newEdge = makeEdge({
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle ?? "none",
      targetHandle: connection.targetHandle ?? "input",
      data: { versionId: versionId },
    });

    const newEdges = addEdge(newEdge, edges);

    set({
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  addNodeAfter: (node, sourceNodeId, sourceHandleId = "none") => {
    const { nodes, edges, versionId } = get();

    const newNode = {
      ...node,
      data: {
        ...node.data,
        versionId: versionId,
        outputs: getOutputsForNode(node),
      },
    };

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
        })
      );
    }

    set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  // addNodeBetweenEdge: (node, edge) => {
  //   const {
  //     nodes,
  //     edges,
  //     versionId,
  //     syncedEdgeIds,
  //     deletedEdgeIds,
  //     dirtyEdgeIds,
  //   } = get();

  //   if (!edge) return;
  //   const sourceEdgeId = edge.id;
  //   // const edge = edges.find((e) => e.id === sourceEdgeId);
  //   // if (!edge) return;

  //   const sourceNode = nodes.find((n) => n.id === edge.source);
  //   const targetNode = nodes.find((n) => n.id === edge.target);
  //   if (!sourceNode || !targetNode) return;

  //   const newNode = { ...node };
  //   newNode.data.outputs = getOutputsForNode(newNode);
  //   newNode.data.versionId = versionId;
  //   const prevId = sourceNode?.data?.id ?? null;
  //   const prevType = sourceNode?.data?.type ?? null;
  //   const nextId = targetNode?.data?.id ?? null;
  //   const nextType = targetNode?.data?.type ?? null;

  //   newNode.data.prev_node_id = prevId;
  //   newNode.data.prev_node_type = prevType;
  //   newNode.data.next_node_id = nextId;
  //   newNode.data.next_node_type = nextType;

  //   let newEdges = edges.filter((e) => e.id !== sourceEdgeId);
  //   const newDeletedEdgeIds = new Set(deletedEdgeIds);
  //   const newDirtyEdgeIds = new Set(dirtyEdgeIds);

  //   if (syncedEdgeIds.has(sourceEdgeId)) {
  //     newDeletedEdgeIds.add(sourceEdgeId);
  //     newDirtyEdgeIds.delete(sourceEdgeId);
  //   }

  //   if (isTriggerNode(node?.data?.type?.toLowerCase?.())) {
  //     set({
  //       nodes: [...nodes, newNode],
  //       edges: newEdges,
  //       sourceEdgeId: null,
  //       showSidebar: false,
  //       deletedEdgeIds: newDeletedEdgeIds,
  //       dirtyEdgeIds: newDirtyEdgeIds,
  //     });
  //     return;
  //   }

  //   const edgeToNew = makeEdge({
  //     source: sourceNode.id,
  //     target: newNode.id,
  //     sourceHandle: edge.sourceHandle ?? "none",
  //     targetHandle: getTargetHandleForNode(newNode),
  //   });

  //   const edgeFromNew = makeEdge({
  //     source: newNode.id,
  //     target: targetNode.id,
  //     sourceHandle: getOutputsForNode(newNode)[0],
  //     targetHandle: edge.targetHandle ?? "input",
  //   });

  //   newEdges.push(edgeToNew, edgeFromNew);

  //   set({
  //     nodes: [...nodes, newNode],
  //     edges: newEdges,
  //     connectedHandles: computeConnectedHandles(newEdges),
  //     sourceEdgeId: null,
  //     showSidebar: false,
  //     deletedEdgeIds: newDeletedEdgeIds,
  //     dirtyEdgeIds: newDirtyEdgeIds,
  //   });
  // },

addNodeBetweenEdge: (node, edge) => {
  const {
    nodes,
    edges,
    versionId,
    syncedEdgeIds,
    deletedEdgeIds,
    dirtyEdgeIds,
  } = get();

  if (!edge) return;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  if (!sourceNode || !targetNode) return;

  // Create node
  const newNode = {
    ...node,
    data: {
      ...node.data,
      versionId,
      outputs: ["none"],
      parentLoop: sourceNode.id,         // mark inside loop
    },
  };

  let newEdges = edges.filter((e) => e.id !== edge.id);

  /* ---------------------------------------
     CASE: INSERT INSIDE LOOP SELF-LOOP
  ---------------------------------------- */
  if (edge.data?.loopType === "self") {
    console.log("-------------------", edge)
    // A) Loop -> NewNode
    const forward = makeEdge({
      source: sourceNode.id,
      sourceHandle: "body",
      target: newNode.id,
      targetHandle: "input",
      data: { loopType: "loop-child" },
    });

    // B) NewNode -> Loop
    const back = makeEdge({
      source: newNode.id,
      sourceHandle: "none",
      target: sourceNode.id,
      targetHandle: "body",
      data: { loopType: "loop-back" },
    });

    newEdges.push(forward, back);
    console.log(nodes,"------------------",  newEdges)
    return set({
      nodes: [...nodes, newNode],
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
      deletedEdgeIds: new Set(deletedEdgeIds),
      dirtyEdgeIds: new Set(dirtyEdgeIds),
      sourceEdgeId: null,
      showSidebar: false,
    });
  }

  /* ---------------------------------------
     DEFAULT INSERT (non-loop)
  ---------------------------------------- */
  const edgeToNew = makeEdge({
    source: sourceNode.id,
    target: newNode.id,
    sourceHandle: edge.sourceHandle ?? "none",
    targetHandle: "input",
  });

  const edgeFromNew = makeEdge({
    source: newNode.id,
    target: targetNode.id,
    sourceHandle: "none",
    targetHandle: edge.targetHandle ?? "input",
  });

  newEdges.push(edgeToNew, edgeFromNew);

  set({
    nodes: [...nodes, newNode],
    edges: newEdges,
    connectedHandles: computeConnectedHandles(newEdges),
    deletedEdgeIds: new Set(deletedEdgeIds),
    dirtyEdgeIds: new Set(dirtyEdgeIds),
    sourceEdgeId: null,
    showSidebar: false,
  });
},



  renameNode: (nodeId, newName) => {
    set((state) => {
      const dirtyNodeIds = new Set(state.dirtyNodeIds);

      // Only mark as dirty if it's a synced node
      if (state.syncedNodeIds.has(nodeId)) {
        dirtyNodeIds.add(nodeId);
      }

      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, name: newName } }
            : node
        ),
        dirtyNodeIds,
      };
    });
  },

  deleteNode: (nodeId) => {
    const state = get();
    const {
      nodes,
      edges,
      syncedNodeIds,
      syncedEdgeIds,
      deletedNodeIds,
      deletedEdgeIds,
      dirtyNodeIds,
      dirtyEdgeIds,
    } = state;

    const deletedNode = nodes.find((n) => n.id === nodeId);
    const isLoop = deletedNode?.data?.type === "loop";

    const incoming = edges.filter((e) => e.target === nodeId);
    const outgoing = edges.filter((e) => e.source === nodeId);

    // Track which edges are being removed
    const removedEdges = edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );

    let updatedEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );

    if (isLoop) {
      const childNodes = nodes.filter((n) => n.parentNode === nodeId);
      const childIds = new Set(childNodes.map((n) => n.id));

      // Track loop-related edges being removed
      const loopEdges = edges.filter(
        (e) =>
          e.source === nodeId ||
          e.target === nodeId ||
          (childIds.has(e.source) && e.target === nodeId)
      );

      removedEdges.push(...loopEdges);

      updatedEdges = updatedEdges.filter(
        (e) => !(e.source === nodeId || e.target === nodeId)
      );
      updatedEdges = updatedEdges.filter(
        (e) => !(childIds.has(e.source) && e.target === nodeId)
      );
    } else {
      // Reconnect previous → next
      if (incoming.length > 0 && outgoing.length > 0) {
        const reconnectedEdges = incoming.map((inEdge) => {
          const outEdge = outgoing[0];
          return makeEdge({
            source: inEdge.source,
            target: outEdge.target,
            sourceHandle: inEdge.sourceHandle ?? "none",
            targetHandle: outEdge.targetHandle ?? "input",
          });
        });

        updatedEdges = [...updatedEdges, ...reconnectedEdges];
        // Note: reconnectedEdges are NEW edges, will be tracked as added
      }
    }

    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const validNodeIds = new Set(updatedNodes.map((n) => n.id));
    const cleanedEdges = updatedEdges.filter(
      (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target)
    );

    // Smart dirty tracking for NODES
    const newDeletedNodeIds = new Set(deletedNodeIds);
    const newDirtyNodeIds = new Set(dirtyNodeIds);

    if (syncedNodeIds.has(nodeId)) {
      // Node existed in backend - add to deleted
      newDeletedNodeIds.add(nodeId);
      // Remove from dirty if it was there
      newDirtyNodeIds.delete(nodeId);
    }

    // Smart dirty tracking for EDGES
    const newDeletedEdgeIds = new Set(deletedEdgeIds);
    const newDirtyEdgeIds = new Set(dirtyEdgeIds);

    // Track deleted edges (only if they were synced)
    removedEdges.forEach((edge) => {
      if (syncedEdgeIds.has(edge.id)) {
        newDeletedEdgeIds.add(edge.id);
        newDirtyEdgeIds.delete(edge.id);
      }
      // If edge wasn't synced, it's new - just remove it
    });

    set({
      nodes: updatedNodes,
      edges: cleanedEdges,
      connectedHandles: computeConnectedHandles(cleanedEdges, updatedNodes),
      deletedNodeIds: newDeletedNodeIds,
      deletedEdgeIds: newDeletedEdgeIds,
      dirtyNodeIds: newDirtyNodeIds,
      dirtyEdgeIds: newDirtyEdgeIds,
    });
  },

  updateNode: (nodeId, nodeData) =>
    set((state) => {
      let {
        nodes,
        edges,
        versionId,
        dirtyNodeIds,
        dirtyEdgeIds,
        deletedEdgeIds,
        syncedEdgeIds,
        syncedNodeIds,
      } = state;

      /* ------------------------------------------------------------
       Find old node
    ------------------------------------------------------------ */
      const oldNode = nodes.find((n) => n.id === nodeId);
      if (!oldNode) return state;

      const oldType = oldNode.data.type;
      const newType = nodeData.type ?? oldType;
      const typeChanged = oldType !== newType;

      /* ------------------------------------------------------------
       Merge updated node data
    ------------------------------------------------------------ */
      const mergedNode: Node<NodeData> = {
        ...oldNode,
        data: { ...oldNode.data, ...nodeData },
      };

      const newDeletedEdgeIds = new Set(deletedEdgeIds);
      const newDirtyEdgeIds = new Set(dirtyEdgeIds);
      const newDirtyNodeIds = new Set(dirtyNodeIds);

      if (syncedNodeIds.has(nodeId)) newDirtyNodeIds.add(nodeId);

      /* ------------------------------------------------------------
       Compute valid outputs
    ------------------------------------------------------------ */
      const newOutputs = getOutputsForNode(mergedNode);
      mergedNode.data.outputs = newOutputs;

      const normalizedOutputs = newOutputs.map((o) => o.toLowerCase());

      /* ------------------------------------------------------------
       Helper to track deleted edges
    ------------------------------------------------------------ */
      const trackDeletedEdges = (list: Edge[]) => {
        list.forEach((edge) => {
          if (syncedEdgeIds.has(edge.id)) {
            newDeletedEdgeIds.add(edge.id);
            newDirtyEdgeIds.delete(edge.id);
          }
        });
      };

      /* ------------------------------------------------------------
       TRIGGER → Remove incoming edges
    ------------------------------------------------------------ */
      if (isTriggerNode(newType)) {
        const incoming = edges.filter((e) => e.target === nodeId);
        trackDeletedEdges(incoming);

        edges = edges.filter((e) => e.target !== nodeId);
      }

      /* ------------------------------------------------------------
       Remove outgoing edges whose handles are invalid
    ------------------------------------------------------------ */
      const invalidOutgoing = edges.filter((e) => {
        if (e.source !== nodeId) return false;
        const h = e.sourceHandle?.toLowerCase();
        return h && !normalizedOutputs.includes(h);
      });

      trackDeletedEdges(invalidOutgoing);

      edges = edges.filter((e) => {
        if (e.source !== nodeId) return true;
        const h = e.sourceHandle?.toLowerCase();
        return h ? normalizedOutputs.includes(h) : true;
      });

      const isLoop = newType === NodeTypeProps.LOOP;

      if (isLoop) {
        // LOOP OUTPUTS
        mergedNode.data.outputs = ["body", "end"];

        // Remove old loop edges (self or end)
        edges = edges.filter((e) => !(e.source === nodeId && e.data?.loopType));

        // ---- 1️⃣ SELF LOOP EDGE ----
        const selfLoop = {
          id: `loop-self-${nodeId}`,
          type: "custom",
          source: nodeId,
          target: nodeId,
          sourceHandle: "body",
          targetHandle: "body",
          animated: true,
          data: {
            loopType: "self",
            versionId,
          },
        };

        // ---- 2️⃣ PLUS NODE FOR END ----
        const plusId = uuidv4();

        const plusNode = {
          id: plusId,
          type: "custom",
          position: {
            x: oldNode.position.x + 250,
            y: oldNode.position.y,
          },
          data: {
            id: plusId,
            type: "addNode",
            versionId,
            parent: nodeId,
            name: "End",
            outputs: ["none"],
          },
        };

        // ---- 3️⃣ END EDGE ----
        const endEdge = {
          id: uuidv4(),
          type: "custom",
          source: nodeId,
          target: plusId,
          sourceHandle: "end",
          targetHandle: "input",
          animated: true,
          data: {
            loopType: "end",
            versionId,
          },
        };

        // ---- FINAL STATE ----
        return {
          ...state,
          nodes: nodes
            .map((n) => (n.id === nodeId ? mergedNode : n))
            .concat([plusNode]),
          edges: edges.concat([selfLoop, endEdge]),
          connectedHandles: computeConnectedHandles(
            edges.concat([selfLoop, endEdge])
          ),
          dirtyNodeIds: newDirtyNodeIds,
          dirtyEdgeIds: newDirtyEdgeIds,
          deletedEdgeIds: newDeletedEdgeIds,
        };
      }

      /* ------------------------------------------------------------
       If NOT conditional/switch/rule → Simple update
    ------------------------------------------------------------ */
      const isConditional =
        !isLoop &&
        (newType === NodeTypeProps.CONDITIONAL ||
          newType === NodeTypeProps.RULE_EXECUTOR ||
          newType === NodeTypeProps.SWITCH);

      if (
        (!isConditional && newType !== NodeTypeProps.LOOP) ||
        isTriggerNode(newType)
      ) {
        return {
          ...state,
          nodes: nodes.map((n) => (n.id === nodeId ? mergedNode : n)),
          edges,
          connectedHandles: computeConnectedHandles(edges),
          dirtyNodeIds: newDirtyNodeIds,
          dirtyEdgeIds: newDirtyEdgeIds,
          deletedEdgeIds: newDeletedEdgeIds,
        };
      }

      /* ------------------------------------------------------------
       CONDITIONAL / SWITCH → Build branch nodes
    ------------------------------------------------------------ */
      const x = oldNode.position.x;
      const y = oldNode.position.y;

      let branchNodes: Node<NodeData>[] = [];
      let branchEdges: Edge[] = [];

      const isSwitch = newType === NodeTypeProps.SWITCH;

      const branchNames = isSwitch
        ? newOutputs
        : newOutputs.map((n) => n.toLowerCase());

      const getOffsetY = (idx: number, total: number, handle: string) => {
        if (!isSwitch) {
          const fixed: Record<string, number> = { true: -100, false: 100 };
          if (fixed[handle] !== undefined) return fixed[handle];
        }
        return idx * 140 - ((total - 1) * 140) / 2;
      };

      branchNames.forEach((handle, index) => {
        const normalized = handle.toLowerCase();

        if (!typeChanged && oldNode.data.outputs?.includes(normalized)) {
          const dirty = edges.find(
            (e) => e.source === nodeId && e.sourceHandle === normalized
          );
          if (dirty) newDirtyEdgeIds.add(dirty.id);
          return;
        }

        const childId = uuidv4();
        const offsetY = getOffsetY(index, branchNames.length, normalized);

        branchNodes.push({
          id: childId,
          type: "custom",
          position: { x: x + 250, y: y + offsetY },
          data: {
            id: childId,
            type: "addNode",
            parent: nodeId,
            versionId,
            name: isSwitch
              ? handle.replace(/_/g, " ").toUpperCase()
              : normalized.charAt(0).toUpperCase() + normalized.slice(1),
            outputs: isSwitch ? ["none"] : [normalized],
          },
        });

        branchEdges.push({
          id: uuidv4(),
          type: "custom",
          source: nodeId,
          sourceHandle: normalized,
          target: childId,
          targetHandle: "input",
          data: { versionId },
        });
      });

      /* ------------------------------------------------------------
       Final state update
    ------------------------------------------------------------ */
      return {
        ...state,
        nodes: nodes
          .map((n) => (n.id === nodeId ? mergedNode : n))
          .concat(branchNodes),
        edges: edges.concat(branchEdges),
        connectedHandles: computeConnectedHandles(edges),
        dirtyNodeIds: newDirtyNodeIds,
        dirtyEdgeIds: newDirtyEdgeIds,
        deletedEdgeIds: newDeletedEdgeIds,
      };
    }),

  setEdgeForSidebar: (edgeId, sourceNodeId) =>
    set({ sourceEdgeId: edgeId, sourceNodeId, showSidebar: true }),

  clearSource: () =>
    set({ sourceNodeId: null, sourceHandleId: null, sourceEdgeId: null }),

  clearAll: () =>
    set({
      nodes: [],
      edges: [],
      connectedHandles: {},
      syncedNodeIds: new Set(),
      syncedEdgeIds: new Set(),
      dirtyNodeIds: new Set(),
      dirtyEdgeIds: new Set(),
      deletedNodeIds: new Set(),
      deletedEdgeIds: new Set(),
    }),
}));
