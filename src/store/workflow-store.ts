import { create } from "zustand";
import React from "react";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
} from "reactflow";
import { computeConnectedHandles, makeEdge } from "@/shared/utils/edge";
import {
  CategoryTypes,
  getOutputsForNode,
  getTargetHandleForNode,
  isTriggerNode,
  NodeExecutionEvent,
  NodeTypeProps,
  VersionData,
} from "@/shared";
import {
  transformEdge,
  transformNode,
} from "@/features/workflow-canvas/helpers/normalize";
import { v4 as uuidv4 } from "uuid";
import { TemplateMeta, WorkflowCategoryList } from "@/features";

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

interface VoidNodeData {
  name: string;
  type: string;
  templateId: string;
}

interface FlowState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  nodeCategories: WorkflowCategoryList;
  voidNode: VoidNodeData | null;
  isDragging: boolean;

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
  currentVersion: VersionData | null;
  activeNode: Node | null;
  nodeTypeMeta: Map<NodeTypeProps, TemplateMeta>;
  categoryMeta: Map<CategoryTypes, TemplateMeta>;
  nodeExecutionState: NodeExecutionEvent;

  // Initialize from backend
  setNodeCategories: (value: WorkflowCategoryList) => void;
  setVoidNode: (nodeData: VoidNodeData) => void;
  getNewNode: (position: XYPosition) => Node<NodeData>;

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
  setCurrentVersion: (data: VersionData | null) => void;

  buildTemplateRegistry: (categories: WorkflowCategoryList) => void;

  // set running node
  setNodeExecutionState: (nodeExecutionState: NodeExecutionEvent) => void;

  // React Flow API
  onNodeDragStop: (
    event: React.MouseEvent | React.PointerEvent,
    node: Node
  ) => void;
  onNodeDrag: (
    event: React.MouseEvent | React.PointerEvent,
    node: Node
  ) => void;
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
    position: XYPosition,
    sourceNodeId: string,
    sourceHandleId?: string
  ) => void;
  addNodeBetweenEdge: (position: XYPosition, edge: Edge) => void;
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

  //syncChanges
  setDeletedNodeId: (nodeId: string) => void;
  setDeletedEdgeId: (edgId: string) => void;
  setDirtyNodeId: (nodeId: string) => void;
  setDirtyEdgeId: (edgeId: string) => void;
}

//  Zustand Store with Dirty Tracking
export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  nodeCategories: [],
  voidNode: null,
  //it is for track pos change bcs if we calculate in onNodeChange it gives us lagging issue
  isDragging: false,

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
  currentVersion: null,
  activeNode: null,
  nodeExecutionState: {},
  nodeTypeMeta: new Map<NodeTypeProps, TemplateMeta>(),
  categoryMeta: new Map<CategoryTypes, TemplateMeta>(),

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

  setNodeExecutionState: (nodeExecutionState: NodeExecutionEvent) =>
    set({ nodeExecutionState }),

  // Rebuild registry from categories
  buildTemplateRegistry: (categories: WorkflowCategoryList) => {
    const state = get();
    const nodeTypeMeta = state.nodeTypeMeta;
    const categoryMeta = state.categoryMeta;
    nodeTypeMeta.clear();
    categoryMeta.clear();

    const traverse = (items: any[]) => {
      for (const item of items) {
        if (item.visibility !== false) {
          categoryMeta.set(item.name, {
            icon: item.metadata?.icon ?? null,
            color: item.metadata?.color ?? "#6B7280",
            border: item.metadata?.border ?? "rgba(107, 114, 128, 0.35)",
            request: item.metadata?.request ?? {},
            response: item.metadata?.response ?? {},
          });
        }
        if (item.nodeTemplates) {
          for (const template of item.nodeTemplates) {
            if (template.visibility === false) continue;

            const type = template.type as NodeTypeProps;

            nodeTypeMeta.set(type, {
              icon: template.metadata?.icon ?? null,
              color: template.metadata?.color ?? "#6B7280",
              border: template.metadata?.border ?? "rgba(107, 114, 128, 0.35)",
              request: template.metadata?.request ?? {},
              response: template.metadata?.response ?? {},
            });
          }
        }
        if (item.subCategories?.length) traverse(item.subCategories);
      }
    };

    traverse(categories);
  },
  getTemplateMeta: (type: NodeTypeProps | string): TemplateMeta => {
    const state = get();
    const meta = state.nodeTypeMeta.get(type as NodeTypeProps);
    if (meta) return meta;

    return {
      color: "#6B7280",
      border: "rgba(107, 114, 128, 0.35)",
      request: {},
      response: {},
    };
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
  setCurrentVersion: (data) => set({ currentVersion: data }),

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
  setNodes: (nodes) => {
    const { syncedNodeIds, dirtyNodeIds } = get();
    const newDirtyNodeIds = new Set([
      ...dirtyNodeIds,
      ...(nodes
        ?.flatMap((node) => node.id)
        ?.filter((nodeId) => syncedNodeIds.has(nodeId)) ?? []),
    ]);
    set({ nodes, dirtyNodeIds: newDirtyNodeIds });
  },

  setEdges: (edges) => {
    const prevEdges = get().edges;
    const handleMap =
      prevEdges.length === edges.length
        ? get().connectedHandles
        : computeConnectedHandles(edges);
    set({ edges, connectedHandles: handleMap });
  },

  deleteEdge: (edgeId: string) => {
    const { edges, setDeletedEdgeId } = get();

    setDeletedEdgeId(edgeId);
    // Remove edge
    const newEdges = edges.filter((e) => e.id !== edgeId);

    set({
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  setSourceNodeId: (id) => set({ sourceNodeId: id }),
  setSourceHandleId: (id) => set({ sourceHandleId: id }),
  setSourceEdgeId: (id) => set({ sourceEdgeId: id }),
  setShowSidebar: (value) => set({ showSidebar: value }),

  // Edge Operations
  addEdge: (edge) => {
    const { edges, currentVersion } = get();
    const newEdges = addEdge(
      { ...edge, data: { ...edge.data, versionId: currentVersion?.id } },
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
  // onNodesChange: (changes) => {
  //   const state = get();
  //   const nodes = applyNodeChanges(changes, state.nodes);

  //   if (nodes !== state.nodes) {
  //     const dirtyNodeIds = new Set(state.dirtyNodeIds);

  //     changes.forEach((change) => {
  //       if (change.type === "position" && state.syncedNodeIds.has(change.id)) {
  //         // find previous node position
  //         const prev = state.nodes.find((n) => n.id === change.id);
  //         // change.position may be present on the change object
  //         const newPos = (change as any).position;
  //         if (prev && newPos) {
  //           const moved =
  //             prev.position?.x !== newPos.x || prev.position?.y !== newPos.y;
  //           if (moved) dirtyNodeIds.add(change.id);
  //         }
  //       }
  //     });

  //     set({ nodes, dirtyNodeIds });
  //   }
  // },

  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes);
    if (nodes !== get().nodes) set({ nodes });
  },
  //on nodeDrag to handle change in pos of not to mark that dirty
  onNodeDrag: (_event, node) => {
    const { isDragging, syncedNodeIds } = get();
    if (isDragging == true || !syncedNodeIds.has(node.id)) return;
    set({ isDragging: true });
  },
  //set dirtyNode and flag to false
  onNodeDragStop: (_event, node) => {
    const state = get();
    if (!state.isDragging) return;
    const dirtyNodeIds = new Set(state.dirtyNodeIds);
    dirtyNodeIds.add(node.id);
    set({ dirtyNodeIds, isDragging: false });
  },

  onEdgesChange: (changes) => {
    const state = get();
    const prevEdges = state.edges;
    const updatedEdges = applyEdgeChanges(changes, prevEdges);
    const nodeIds = new Set(state.nodes.map((n) => n.id));

    const cleanedEdges = updatedEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    //i think we don't need it bcs we have other function to delete edge
    // changes.forEach((change) => {
    //   if (change.type === "remove") {
    //     state.setDeletedEdgeId(change.id);
    //   }
    // });

    if (cleanedEdges !== prevEdges) {
      set({
        edges: cleanedEdges,
        connectedHandles: computeConnectedHandles(cleanedEdges),
      });
    }
  },

  onConnect: (connection) => {
    const { edges } = get();

    const newEdge = makeEdge({
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle ?? "none",
      targetHandle: connection.targetHandle ?? "input",
    });

    const newEdges = addEdge(newEdge, edges);

    set({
      edges: newEdges,
      connectedHandles: computeConnectedHandles(newEdges),
    });
  },

  addNodeAfter: (position, sourceNodeId, sourceHandleId = "none") => {
    const { nodes, edges, getNewNode } = get();
    const newNode = getNewNode(position);

    const filteredEdges = edges.filter(
      (e) => !(e.source === sourceNodeId && e.sourceHandle === sourceHandleId)
    );

    const newEdges: Edge[] = [...filteredEdges];

    //will remove this if condition
    if (!isTriggerNode(newNode?.data?.type?.toLowerCase?.())) {
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

  addNodeBetweenEdge: (position, edge) => {
    const { nodes, edges, getNewNode, setDeletedEdgeId } = get();

    if (!edge) return;
    const sourceEdgeId = edge.id;
    // const edge = edges.find((e) => e.id === sourceEdgeId);
    // if (!edge) return;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return;

    const newNode = getNewNode(position);
    let newEdges = edges.filter((e) => e.id !== sourceEdgeId);

    setDeletedEdgeId(sourceEdgeId);

    if (isTriggerNode(newNode?.data?.type?.toLowerCase?.())) {
      set({
        nodes: [...nodes, newNode],
        edges: newEdges,
        sourceEdgeId: null,
        showSidebar: false,
      });
      return;
    }

    const edgeToNew = makeEdge({
      source: sourceNode.id,
      target: newNode.id,
      sourceHandle: edge.sourceHandle ?? "none",
      targetHandle: getTargetHandleForNode(newNode),
      data: edge.data,
    });

    const edgeFromNew = makeEdge({
      source: newNode.id,
      target: targetNode.id,
      sourceHandle: getOutputsForNode(newNode)[0],
      targetHandle: edge.targetHandle ?? "input",
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
      setDeletedNodeId,
      activeNode,
      setActiveNode,
      setDeletedEdgeId,
    } = state;

    if (activeNode && activeNode?.id == nodeId) setActiveNode(null);

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
            data: inEdge?.data ?? {},
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
    setDeletedNodeId(nodeId);

    // Track deleted edges (only if they were synced)
    removedEdges.forEach((edge) => {
      setDeletedEdgeId(edge.id);
    });

    set({
      nodes: updatedNodes,
      edges: cleanedEdges,
      connectedHandles: computeConnectedHandles(cleanedEdges, updatedNodes),
    });
  },
  updateNode: (nodeId, nodeData) => {
    let {
      nodes,
      edges,
      currentVersion,
      setDeletedEdgeId,
      setDirtyEdgeId,
      setDirtyNodeId,
      getNewNode,
      setDeletedNodeId,
      _updateNodeInternals,
      setActiveNode,
    } = get();

    // Find existing node
    const oldNode = nodes.find((n) => n.id === nodeId);
    if (!oldNode) return;

    const oldType = oldNode.data.type;
    const newType = nodeData.type ?? oldType;
    const typeChanged = oldType !== newType;
    // Merge or reset data
    // const mergedData = typeChanged
    // ? { ...nodeData } // FULL RESET
    // : { ...oldNode.data, ...nodeData }; // merge for same type

    const newNodeId = uuidv4();
    const mergedNode: Node<NodeData> = {
      ...oldNode,
      ...(typeChanged ? { id: newNodeId } : {}),
      data: {
        ...oldNode.data,
        ...nodeData,
        ...(typeChanged ? { id: newNodeId } : {}),
      },
    };
    setActiveNode(mergedNode);

    // Recompute outputs
    const newOutputs = getOutputsForNode(mergedNode);
    mergedNode.data.outputs = newOutputs;

    const normalizedOutputs = newOutputs.map((o) => o.toLowerCase());

    const trackDeletedEdges = (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        setDeletedEdgeId(edge.id);
      });
    };

    //set nodeId dirty or delete node
    typeChanged ? setDeletedNodeId(nodeId) : setDirtyNodeId(nodeId);

    // SPECIAL RULE: If the node is a TRIGGER → remove all incoming edges
    if (isTriggerNode(newType)) {
      const incomingEdges = edges.filter((edge) => edge.target === nodeId);
      edges = edges.filter((edge) => edge.target !== nodeId);

      trackDeletedEdges(incomingEdges);
    }

    //check for typeChange & Update Edge as per that
    // Update invalid edges for this node (only outgoing)
    if (typeChanged) {
      const affectedEdges = edges.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );

      // Track old edges as deleted
      trackDeletedEdges(affectedEdges);

      // Update edges with new node ID
      edges = edges.map((edge) => {
        if (edge.source !== nodeId && edge.target !== nodeId) return edge;

        if (edge.source === nodeId) {
          return {
            ...edge,
            id: uuidv4(), // New edge ID
            source: mergedNode.id,
            sourceHandle: normalizedOutputs[0],
          };
        } else {
          return {
            ...edge,
            id: uuidv4(), // New edge ID
            target: mergedNode.id,
          };
        }
      });

      //hot fix critical here
      const sourceEdgeId = edges.find(
        (edge) => edge.source === mergedNode.id
      )?.id;
      if (sourceEdgeId) oldNode.data.outputs?.push(normalizedOutputs[0]);
    }

    // If NOT conditional/rule/switch → simple update
    const isConditional =
      newType === NodeTypeProps.CONDITIONAL ||
      newType === NodeTypeProps.RULE_EXECUTOR ||
      newType === NodeTypeProps.SWITCH;

    // If TRIGGER node → also behave like simple node
    if (!isConditional || isTriggerNode(newType)) {
      set({
        nodes: nodes.map((n) => (n.id == nodeId ? mergedNode : n)),
        edges,
        connectedHandles: computeConnectedHandles(edges),
      });
      return;
    }

    // ------------------------------------------------------------
    // CONDITIONAL, RULE EXECUTOR, or SWITCH → Create branch children
    // ------------------------------------------------------------

    const x = oldNode.position.x;
    const y = oldNode.position.y;

    let branchNodes: Node<NodeData>[] = [];
    let branchEdges: Edge[] = [];

    // Handle SWITCH node differently
    const isSwitch = newType === NodeTypeProps.SWITCH;

    const branchNames = isSwitch
      ? newOutputs // e.g. ["case_1", "case_2", ...]
      : newOutputs.map((out) => out.toLowerCase()); // ["on_true","on_false"] etc.

    // Offset logic (clean)
    const getOffsetY = (idx: number, total: number, handle: string) => {
      if (!isSwitch) {
        // Conditional → True/False custom spacing
        const fixedOffsets: Record<string, number> = {
          true: -100,
          false: 100,
        };
        if (fixedOffsets[handle] !== undefined) return fixedOffsets[handle];
      }
      // Switch or generic fallback
      return idx * 140 - ((total - 1) * 140) / 2;
    };
    branchNames.forEach((handle, index) => {
      const normalized = handle.toLowerCase();
      if (oldNode.data.outputs?.includes(normalized)) {
        if (!isSwitch) return;
        edges = edges.map((edge) => {
          const isMatch =
            edge.source === mergedNode.id && edge.sourceHandle === normalized;

          if (!isMatch) return edge;

          const caseData =
            isSwitch && nodeData?.configuration
              ? nodeData?.configuration?.switchCases?.find(
                  (c: any) => c.condition === normalized
                )
              : null;

          return {
            ...edge,
            data: {
              ...edge.data,
              ...(caseData ?? {}),
            },
          };
        });

        const dirtyEdge = edges.find(
          (e) => e.source == mergedNode.id && e.sourceHandle == normalized
        );

        if (dirtyEdge) setDirtyEdgeId(dirtyEdge.id);
        return;
      }

      // const childId = uuidv4();
      const offsetY = getOffsetY(index, branchNames.length, normalized);
      const newBranchNode = getNewNode({ x: x + 250, y: y + offsetY });
      branchNodes.push(newBranchNode);

      // Edge
      branchEdges.push({
        id: uuidv4(),
        type: "custom",
        source: mergedNode.id,
        sourceHandle: normalized,
        target: newBranchNode.id,
        targetHandle: "input",
        ...(isSwitch && {
          label: handle.replace(/_/g, " ").toUpperCase(),
          labelStyle: { fontWeight: 600, fontSize: 12 },
        }),
        data: {
          versionId: currentVersion?.id,
          condition: normalized,
          ...(isSwitch &&
            nodeData?.configuration && {
              ...nodeData?.configuration?.switchCases.find(
                (e: any) => e.condition == normalized
              ),
            }),
        },
      });
    });

    //delete edges for switch node

    if (isSwitch) {
      const oldConditions =
        oldNode.data?.configuration?.switchCases?.flatMap(
          (e: any) => e.condition
        ) ?? [];
      const newConditions =
        nodeData?.configuration?.switchCases?.flatMap(
          (e: any) => e.condition
        ) ?? [];
      const casesToDelete = oldConditions?.filter(
        (e: any) => !newConditions?.includes(e)
      );
      const deletedEdges = edges.filter(
        (e) =>
          e.source === mergedNode.id && casesToDelete?.includes(e.sourceHandle)
      );
      edges = edges.filter((e) => {
        if (e.source != mergedNode.id) return true;
        return !casesToDelete?.includes(e.sourceHandle);
      });
      trackDeletedEdges(deletedEdges);
    }
    const finalEdges = [...edges, ...branchEdges];
    const finalNodes = [
      ...nodes.map((n) => (n.id == nodeId ? mergedNode : n)),
      ...branchNodes,
    ];

    set({
      nodes: finalNodes,
      edges: finalEdges,
      connectedHandles: computeConnectedHandles(finalEdges),
    });
    _updateNodeInternals?.(mergedNode.id);
  },

  setNodeCategories: (categories) => set({ nodeCategories: categories }),

  setVoidNode: (nodeData) => set({ voidNode: nodeData }),

  getNewNode: (position) => {
    const { voidNode, currentVersion } = get();
    const id = uuidv4();
    const newNode = {
      id,
      type: "custom",
      position,
      data: {
        id,
        name: voidNode?.name ?? "",
        type: voidNode?.type ?? "void_node",
        templateId: voidNode?.templateId,
        versionId: currentVersion?.id ?? null,
        outputs: ["none"],
      },
    };

    return newNode;
  },

  setDeletedNodeId: (nodeId) => {
    const { syncedNodeIds, deletedNodeIds, dirtyNodeIds } = get();
    const newDeletedNodeIds = new Set(deletedNodeIds);
    const newDirtyNodeIds = new Set(dirtyNodeIds);
    if (syncedNodeIds.has(nodeId)) {
      newDeletedNodeIds.add(nodeId);
      newDirtyNodeIds.delete(nodeId);
    }
    set({
      deletedNodeIds: newDeletedNodeIds,
      dirtyNodeIds: newDirtyNodeIds,
    });
  },

  setDeletedEdgeId: (edgeId) => {
    const { syncedEdgeIds, deletedEdgeIds, dirtyEdgeIds } = get();
    const newDeletedEdgeIds = new Set(deletedEdgeIds);
    const newDirtyEdgeIds = new Set(dirtyEdgeIds);
    if (syncedEdgeIds.has(edgeId)) {
      newDeletedEdgeIds.add(edgeId);
      newDirtyEdgeIds.delete(edgeId);
    }
    set({
      deletedEdgeIds: newDeletedEdgeIds,
      dirtyEdgeIds: newDirtyEdgeIds,
    });
  },
  setDirtyNodeId: (nodeId) => {
    const { syncedNodeIds, dirtyNodeIds } = get();
    const newDirtyNodeIds = new Set(dirtyNodeIds);
    if (syncedNodeIds.has(nodeId)) {
      newDirtyNodeIds.add(nodeId);
    }
    set({
      dirtyNodeIds: newDirtyNodeIds,
    });
  },
  setDirtyEdgeId: (edgeId) => {
    const { syncedEdgeIds, dirtyEdgeIds } = get();
    const newDirtyEdgeIds = new Set(dirtyEdgeIds);
    if (syncedEdgeIds.has(edgeId)) {
      newDirtyEdgeIds.add(edgeId);
    }
    set({
      dirtyEdgeIds: newDirtyEdgeIds,
    });
  },
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
