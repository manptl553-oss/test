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

addNodeBetweenEdge: (node, edge) => {
  const { nodes, edges, versionId } = get();
  if (!edge) return;

  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return;

  // Remove the original clicked edge
  let newEdges = edges.filter((e) => e.id !== edge.id);

  const isBranchingNode = (n?: Node<NodeData>) => {
    const t = n?.data?.type;
    return t === "conditional" || t === "switch" || t === "rule-executor";
  };

  /* ============================================================
   *  CASE 1: Insert FIRST child from loop self-edge
   *  (loopType = "self") – only used when loop has no children yet
   * ========================================================== */
  if (edge.data?.loopType === "self") {
    const loopId = source.id;

    const newChild: Node<NodeData> = {
      ...node,
      data: {
        ...node.data,
        parentLoop: loopId,
        outputs: ["none"],
        versionId,
      },
    };

    const finalEdges = [
      ...newEdges,

      // loop → child
      makeEdge({
        source: loopId,
        target: newChild.id,
        sourceHandle: "body",
        targetHandle: "input",
        data: { loopType: "loop-child", loopOwner: loopId },
      }),

      // child → loop (return)
      makeEdge({
        source: newChild.id,
        target: loopId,
        sourceHandle: isBranchingNode(newChild) ? "true" : "none",
        targetHandle: "body",
        data: { loopType: "loop-back", loopOwner: loopId },
      }),
    ];

    return set({
      nodes: [...nodes, newChild],
      edges: finalEdges,
      connectedHandles: computeConnectedHandles(finalEdges),
    });
  }

  /* ============================================================
   *  CASE 2: Insert between siblings of SAME loop body
   * ========================================================== */
  const loopA = source.data?.parentLoop;
  const loopB = target.data?.parentLoop;

  const sameLoopChild =
    loopA && loopB && loopA === loopB && !edge.data?.loopType;

  /* ============================================================
   *  CASE 3: INSERT from loop-return PLUS
   *  ALWAYS APPEND at END of loop chain
   * ========================================================== */
  const isLoopReturn = edge.data?.loopType === "loop-back";

  if (sameLoopChild || isLoopReturn) {
    // Which loop are we modifying?
    // For return edge, trust loopOwner; for body edge, use parentLoop
    const loopId = isLoopReturn
      ? edge.data?.loopOwner ?? target.id
      : loopA;

    const loopNode = nodes.find((n) => n.id === loopId);
    if (!loopNode) return;

    // All children of THAT loop ONLY (ordered by x)
    const children = nodes
      .filter((n) => n.data?.parentLoop === loopId)
      .sort((a, b) => a.position.x - b.position.x);

    const SPACING = 220;

    let insertIndex: number;
    let insertX: number;

    if (sameLoopChild) {
      // Insert between siblings inside chain
      insertIndex = children.findIndex((c) => c.id === target.id);
      if (insertIndex === -1) {
        // target is not actually in children – just fall back to default
        return defaultInsert();
      }
      insertX = source.position.x + SPACING;
    } else {
      // RETURN EDGE → ALWAYS APPEND at the end of loop children
      insertIndex = children.length;

      if (children.length > 0) {
        insertX = children[children.length - 1].position.x + SPACING;
      } else {
        insertX = loopNode.position.x + SPACING;
      }
    }

    // Place vertically below loop node
    const insertY = loopNode.position.y + 200;

    const newChild: Node<NodeData> = {
      ...node,
      position: { x: insertX, y: insertY },
      data: {
        ...node.data,
        parentLoop: loopId,
        outputs: ["none"],
        versionId,
      },
    };

    // Insert into ordered children list
    const ordered = [
      ...children.slice(0, insertIndex),
      newChild,
      ...children.slice(insertIndex),
    ];

    // Remove only THIS LOOP's edges; do not touch parent or nested loops
    newEdges = newEdges.filter((e) => e.data?.loopOwner !== loopId);

    const rebuilt: Edge[] = [];

    // loop → first child
    if (ordered.length > 0) {
      rebuilt.push(
        makeEdge({
          source: loopId,
          target: ordered[0].id,
          sourceHandle: "body",
          targetHandle: "input",
          data: { loopType: "loop-child", loopOwner: loopId },
        })
      );
    }

    // child → child chain
    for (let i = 0; i < ordered.length - 1; i++) {
      const a = ordered[i];
      const b = ordered[i + 1];

      rebuilt.push(
        makeEdge({
          source: a.id,
          target: b.id,
          sourceHandle: isBranchingNode(a) ? "true" : "none",
          targetHandle: "input",
          data: { loopType: "loop-child", loopOwner: loopId },
        })
      );
    }

    // LAST CHILD → LOOP-RETURN
    const last = ordered[ordered.length - 1];

    rebuilt.push(
      makeEdge({
        source: last.id,
        target: loopId,
        sourceHandle: isBranchingNode(last) ? "true" : "none",
        targetHandle: "body",
        data: { loopType: "loop-back", loopOwner: loopId },
      })
    );

    const finalEdges = [...newEdges, ...rebuilt];

    return set({
      nodes: [...nodes, newChild],
      edges: finalEdges,
      connectedHandles: computeConnectedHandles(finalEdges),
    });
  }

  /* ============================================================
   *  CASE 4: DEFAULT NODE INSERTION (non-loop)
   * ========================================================== */
  const newDefault: Node<NodeData> = {
    ...node,
    data: {
      ...node.data,
      outputs: ["none"],
      versionId,
    },
  };

  const outEdges = [
    ...newEdges,

    // split original edge: source → new → target
    makeEdge({
      source: source.id,
      target: newDefault.id,
      sourceHandle: edge.sourceHandle ?? "none",
      targetHandle: "input",
    }),

    makeEdge({
      source: newDefault.id,
      target: target.id,
      sourceHandle: "none",
      targetHandle: edge.targetHandle ?? "input",
    }),
  ];

  function defaultInsert() {
    return set({
      nodes: [...nodes, newDefault],
      edges: outEdges,
      connectedHandles: computeConnectedHandles(outEdges),
    });
  }

  return defaultInsert();
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

      /* ------------------------------------------------------------
       Merge updated data
    ------------------------------------------------------------ */
      const mergedNode = {
        ...oldNode,
        data: { ...oldNode.data, ...nodeData },
      };

      const newDeletedEdgeIds = new Set(deletedEdgeIds);
      const newDirtyEdgeIds = new Set(dirtyEdgeIds);
      const newDirtyNodeIds = new Set(dirtyNodeIds);
      if (syncedNodeIds.has(nodeId)) newDirtyNodeIds.add(nodeId);

      /* ------------------------------------------------------------
       Outputs
    ------------------------------------------------------------ */
      const newOutputs = getOutputsForNode(mergedNode);
      mergedNode.data.outputs = newOutputs;
      const normalizedOutputs = newOutputs.map((o) => o.toLowerCase());

      /* ------------------------------------------------------------
      Helper: mark synced edges as deleted
    ------------------------------------------------------------ */
      const trackDeletedEdges = (list) => {
        for (const e of list) {
          if (syncedEdgeIds.has(e.id)) {
            newDeletedEdgeIds.add(e.id);
            newDirtyEdgeIds.delete(e.id);
          }
        }
      };

      /* ------------------------------------------------------------
       TRIGGER NODES — No incoming allowed
    ------------------------------------------------------------ */
      if (isTriggerNode(newType)) {
        const incoming = edges.filter((e) => e.target === nodeId);
        trackDeletedEdges(incoming);
        edges = edges.filter((e) => e.target !== nodeId);
      }

      /* ------------------------------------------------------------
       Remove invalid output edges on update
    ------------------------------------------------------------ */
      const invalidOutgoing = edges.filter((e) => {
        if (e.source !== nodeId) return false;
        return (
          e.sourceHandle &&
          !normalizedOutputs.includes(e.sourceHandle.toLowerCase())
        );
      });

      trackDeletedEdges(invalidOutgoing);

      edges = edges.filter((e) => {
        if (e.source !== nodeId) return true;
        const h = e.sourceHandle?.toLowerCase();
        return !h || normalizedOutputs.includes(h);
      });

      /* ------------------------------------------------------------
      LOOP NODE
    ------------------------------------------------------------ */
      /* ------------------------------------------------------------
  LOOP NODE
------------------------------------------------------------ */
      const isLoop = newType === NodeTypeProps.LOOP;

      if (isLoop) {
        mergedNode.data.outputs = ["body", "end"];

        const parentLoopId = mergedNode.data.parentLoop as string | undefined;
        const hasParentLoop = !!parentLoopId;

        // remove any old special loop edges that belonged to THIS node
        edges = edges.filter((e) => !(e.source === nodeId && e.data?.loopType));

        // common self-edge for any loop (draw its own rectangle)
        const selfEdge = {
          id: `loop-self-${nodeId}`,
          type: "custom" as const,
          source: nodeId,
          target: nodeId,
          sourceHandle: "body",
          targetHandle: "body",
          animated: true,
          data: { loopType: "self",  loopOwner: nodeId,versionId },
        };

        // ----------------------------------------------------------
        // 1️⃣ CHILD LOOP – loop placed INSIDE another loop
        // ----------------------------------------------------------
        if (hasParentLoop) {
          const parentLoop = nodes.find((n) => n.id === parentLoopId);
          if (!parentLoop) {
            // safety: fall back to normal loop behaviour
            const plusId = uuidv4();
            const plusNode = {
              id: plusId,
              type: "custom" as const,
              position: { x: oldNode.position.x + 260, y: oldNode.position.y },
              data: {
                id: plusId,
                type: "addNode",
                parent: nodeId,
                outputs: ["none"],
                versionId,
              },
            };

            const endEdge = {
              id: uuidv4(),
              type: "custom" as const,
              animated: true,
              source: nodeId,
              target: plusId,
              sourceHandle: "end",
              targetHandle: "input",
              data: { loopType: "end", loopOwner: nodeId,versionId },
            };

            const edgesWithLoop = edges.concat(selfEdge, endEdge);

            return {
              ...state,
              nodes: nodes
                .map((n) => (n.id === nodeId ? mergedNode : n))
                .concat(plusNode),
              edges: edgesWithLoop,
              connectedHandles: computeConnectedHandles(edgesWithLoop),
              dirtyNodeIds: newDirtyNodeIds,
              dirtyEdgeIds: newDirtyEdgeIds,
              deletedEdgeIds: newDeletedEdgeIds,
            };
          }

          // any existing edge parentLoop -> this node (from + dummy) becomes loop-child
          edges = edges.map((e) => {
            if (e.source === parentLoop.id && e.target === nodeId) {
              return {
                ...e,
                sourceHandle: e.sourceHandle ?? "body",
                targetHandle: "input",
                data: { ...(e.data || {}), loopType: "loop-child", versionId },
              };
            }
            return e;
          });

          // create DONE dummy inside the CHILD loop
          const doneDummyId = uuidv4();
          const doneDummyNode = {
            id: doneDummyId,
            type: "custom" as const,
            position: { x: oldNode.position.x + 260, y: oldNode.position.y },
            data: {
              id: doneDummyId,
              type: "addNode",
              // this dummy lives inside the CHILD loop
              parentLoop: nodeId,
              outputs: ["none"],
              versionId,
            },
          };

          // childLoop.done -> doneDummy (inside child rectangle)
          const childEndToDummy = {
            id: uuidv4(),
            type: "custom" as const,
            source: nodeId,
            target: doneDummyId,
            sourceHandle: "end",
            targetHandle: "input",
            animated: true,
            data: { loopType: "loop-child", versionId },
          };

          // doneDummy -> parentLoop  (this draws the BIG parent loop rectangle)
          const dummyToParentLoop = {
            id: uuidv4(),
            type: "custom" as const,
            source: doneDummyId,
            target: parentLoop.id,
            sourceHandle: "none",
            targetHandle: "body",
            animated: true,
            data: { loopType: "loop-back", versionId },
          };

          const edgesWithLoop = edges.concat(
            selfEdge,
            childEndToDummy,
            dummyToParentLoop
          );

          return {
            ...state,
            nodes: nodes
              .map((n) => (n.id === nodeId ? mergedNode : n))
              .concat(doneDummyNode),
            edges: edgesWithLoop,
            connectedHandles: computeConnectedHandles(edgesWithLoop),
            dirtyNodeIds: newDirtyNodeIds,
            dirtyEdgeIds: newDirtyEdgeIds,
            deletedEdgeIds: newDeletedEdgeIds,
          };
        }

        // ----------------------------------------------------------
        // 2️⃣ ROOT LEVEL LOOP – your existing behaviour
        // ----------------------------------------------------------
        const plusId = uuidv4();
        const plusNode = {
          id: plusId,
          type: "custom" as const,
          position: { x: oldNode.position.x + 260, y: oldNode.position.y },
          data: {
            id: plusId,
            type: "addNode",
            parent: nodeId,
            outputs: ["none"],
            versionId,
          },
        };

        const endEdge = {
          id: uuidv4(),
          type: "custom" as const,
          animated: true,
          source: nodeId,
          target: plusId,
          sourceHandle: "end",
          targetHandle: "input",
          data: { loopType: "end", versionId },
        };

        const edgesWithLoop = edges.concat(selfEdge, endEdge);

        return {
          ...state,
          nodes: nodes
            .map((n) => (n.id === nodeId ? mergedNode : n))
            .concat(plusNode),
          edges: edgesWithLoop,
          connectedHandles: computeConnectedHandles(edgesWithLoop),
          dirtyNodeIds: newDirtyNodeIds,
          dirtyEdgeIds: newDirtyEdgeIds,
          deletedEdgeIds: newDeletedEdgeIds,
        };
      }

      /* ------------------------------------------------------------
      CONDITIONAL / SWITCH LOGIC
    ------------------------------------------------------------ */
      const isConditional =
        newType === NodeTypeProps.CONDITIONAL ||
        newType === NodeTypeProps.RULE_EXECUTOR ||
        newType === NodeTypeProps.SWITCH;

      if (!isConditional || isTriggerNode(newType)) {
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
      CONDITIONAL ***INSIDE LOOP***
    ------------------------------------------------------------ */

      const parentLoop = nodes.find((n) => n.id === mergedNode.data.parentLoop);

      // only LOOP or RULE_EXECUTOR define loop structure
      const isInsideLoop =
        parentLoop && parentLoop.data.type === NodeTypeProps.LOOP;

      if (isInsideLoop) {
        const loopId = parentLoop.id;
        const px = oldNode.position.x;
        const py = oldNode.position.y;

        const branchNodes = [];
        const branchEdges = [];

        /* =========================================================
      1️⃣ CONDITIONAL / RULE EXECUTOR inside loop
  ========================================================= */
        if (
          newType === NodeTypeProps.CONDITIONAL ||
          newType === NodeTypeProps.RULE_EXECUTOR
        ) {
          // TRUE → into loop rectangle
          const trueDummy = uuidv4();
          branchNodes.push({
            id: trueDummy,
            type: "custom",
            position: { x: px + 260, y: py },
            data: {
              id: trueDummy,
              type: "addNode",
              parentLoop: loopId,
              outputs: ["none"],
              versionId,
            },
          });

          branchEdges.push({
            id: uuidv4(),
            type: "custom",
            source: nodeId,
            target: trueDummy,
            sourceHandle: "true",
            targetHandle: "input",
            animated: true,
            data: { loopType: "loop-child", versionId },
          });

          // dummy → loop rectangle
          branchEdges.push({
            id: uuidv4(),
            type: "custom",
            source: trueDummy,
            target: loopId,
            sourceHandle: "none",
            targetHandle: "body",
            animated: true,
            data: { loopType: "loop-back", versionId },
          });

          const falseDummy = uuidv4();
          branchNodes.push({
            id: falseDummy,
            type: "custom",
            position: { x: px + 260, y: py + 180 },
            data: {
              id: falseDummy,
              type: "addNode",
              parentLoop: loopId,
              versionId,
              outputs: ["none"],
            },
          });

          branchEdges.push({
            id: uuidv4(),
            type: "custom",
            source: nodeId,
            target: falseDummy,
            sourceHandle: "false",
            targetHandle: "input",
            animated: true,
            data: { versionId },
          });

          return {
            ...state,
            nodes: nodes
              .map((n) => (n.id === nodeId ? mergedNode : n))
              .concat(branchNodes),
            edges: edges.concat(branchEdges),
          };
        }

        /* =========================================================
      2️⃣ SWITCH inside loop
      Case1 → inside loop
      CaseN → outside stack
  ========================================================= */
        if (newType === NodeTypeProps.SWITCH) {
          const firstHandle = normalizedOutputs[0];

          // CASE 1: loop child
          const case1Dummy = uuidv4();
          branchNodes.push({
            id: case1Dummy,
            type: "custom",
            position: { x: px + 260, y: py },
            data: {
              id: case1Dummy,
              type: "addNode",
              parentLoop: loopId,
              outputs: ["none"],
              versionId,
            },
          });

          branchEdges.push({
            id: uuidv4(),
            type: "custom",
            source: nodeId,
            target: case1Dummy,
            sourceHandle: firstHandle,
            targetHandle: "input",
            animated: true,
            data: { loopType: "loop-child", versionId },
          });

          branchEdges.push({
            id: uuidv4(),
            type: "custom",
            source: case1Dummy,
            target: loopId,
            sourceHandle: "none",
            targetHandle: "body",
            animated: true,
            data: { loopType: "loop-back", versionId },
          });

          // CASE 2..N → OUTSIDE
          for (let i = 1; i < normalizedOutputs.length; i++) {
            const handle = normalizedOutputs[i];

            const dummyId = uuidv4();
            branchNodes.push({
              id: dummyId,
              type: "custom",
              position: { x: px + 260, y: py + i * 180 },
              data: {
                id: dummyId,
                type: "addNode",
                parentLoop: loopId,
                outputs: ["none"],
                versionId,
              },
            });

            branchEdges.push({
              id: uuidv4(),
              type: "custom",
              source: nodeId,
              target: dummyId,
              sourceHandle: handle,
              targetHandle: "input",
              animated: true,
              data: { versionId },
            });
          }

          return {
            ...state,
            nodes: nodes
              .map((n) => (n.id === nodeId ? mergedNode : n))
              .concat(branchNodes),
            edges: edges.concat(branchEdges),
          };
        }
      }

      /* ------------------------------------------------------------
      CONDITIONAL OUTSIDE LOOP — Standard branching
    ------------------------------------------------------------ */
      const bx = oldNode.position.x;
      const by = oldNode.position.y;

      const children = [];
      const cEdges = [];

      normalizedOutputs.forEach((handle, i) => {
        const id = uuidv4();
        children.push({
          id,
          type: "custom",
          position: { x: bx + 250, y: by + i * 160 },
          data: {
            id,
            type: "addNode",
            parent: nodeId,
            versionId,
            outputs: ["none"],
          },
        });

        cEdges.push({
          id: uuidv4(),
          type: "custom",
          source: nodeId,
          target: id,
          sourceHandle: handle,
          targetHandle: "input",
          animated: true,
          data: { versionId },
        });
      });

      return {
        ...state,
        nodes: nodes
          .map((n) => (n.id === nodeId ? mergedNode : n))
          .concat(children),
        edges: edges.concat(cEdges),
        connectedHandles: computeConnectedHandles(edges.concat(cEdges)),
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
