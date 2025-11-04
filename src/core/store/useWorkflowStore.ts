import { create } from 'zustand';
import type { Node, Edge, Connection, NodeChange, EdgeChange } from 'reactflow';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { computeConnectedHandles, makeEdge } from '../utils/flowUtils';
import { getOutputsForNode, getSelfLoopHandle, getTargetHandleForNode, isTriggerNode } from '../nodes/registry';

interface NodeData {
  backend_id: string | null;
  id: string;
  name: string;
  type: string;
  outputs?: string[];
  parentLoop?: string;
  configuration?: any;
  data?: any;
}
interface FlowState {
  nodes: Node<NodeData>[]; edges: Edge[];
  sourceNodeId: string | null; sourceHandleId: string | null; sourceEdgeId: string | null;
  showSidebar: boolean; connectedHandles: Record<string, Set<string>>;
  workflowId: string | null; setWorkflowId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange[]) => void; onEdgesChange: (changes: EdgeChange[]) => void; onConnect: (connection: Connection) => void;
  addEdge: (edge: Edge) => void; setNodes: (nodes: Node[]) => void; setEdges: (edges: Edge[]) => void;
  setSourceNodeId: (id: string | null) => void; setSourceHandleId: (id: string | null) => void; setSourceEdgeId: (id: string | null) => void;
  setShowSidebar: (value: boolean) => void;
  addNode: (node: Node, shouldConnect?: boolean) => void; addNodeAfter: (node: Node, sourceNodeId: string, sourceHandleId?: string) => void;
  addNodeBetweenEdge: (node: Node) => void; deleteNode: (nodeId: string) => void; renameNode: (id: string, newName: string) => void;
  setEdgeForSidebar: (edgeId: string, sourceNodeId: string) => void; clearSource: () => void; clearAll: () => void;
  _updateNodeInternals?: (id: string) => void; setUpdateNodeInternals: (fn: (id: string) => void) => void;
  refreshNodeHandles: (nodeId: string) => void; refreshManyHandles: (nodeIds: string[]) => void;
}
export const useWorkflowStore = create<FlowState>((set, get) => ({
  nodes: [], edges: [], sourceNodeId: null, sourceHandleId: null, sourceEdgeId: null, showSidebar: false, connectedHandles: {}, workflowId: null,
  setWorkflowId: (id) => set({ workflowId: id }),
  _updateNodeInternals: undefined, setUpdateNodeInternals: (fn) => set({ _updateNodeInternals: fn }),
  refreshNodeHandles: (nodeId) => { const fn = get()._updateNodeInternals; if (!fn) return; requestAnimationFrame(() => fn(nodeId)); },
  refreshManyHandles: (nodeIds) => { const fn = get()._updateNodeInternals; if (!fn) return; requestAnimationFrame(() => nodeIds.forEach((id) => fn(id))); },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => { const prevEdges = get().edges; const handleMap = prevEdges.length === edges.length ? get().connectedHandles : computeConnectedHandles(edges); set({ edges, connectedHandles: handleMap }); },
  setSourceNodeId: (id) => set({ sourceNodeId: id }), setSourceHandleId: (id) => set({ sourceHandleId: id }), setSourceEdgeId: (id) => set({ sourceEdgeId: id }),
  setShowSidebar: (value) => set({ showSidebar: value }),
  addEdge: (edge) => { const { edges } = get(); const newEdges = addEdge(edge, edges); set({ edges: newEdges, connectedHandles: computeConnectedHandles(newEdges) }); },
  onNodesChange: (changes) => { const nodes = applyNodeChanges(changes, get().nodes); if (nodes !== get().nodes) set({ nodes }); },
  onEdgesChange: (changes) => { const prevEdges = get().edges; const updatedEdges = applyEdgeChanges(changes, prevEdges); const nodeIds = new Set(get().nodes.map((n) => n.id)); const cleanedEdges = updatedEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)); if (cleanedEdges !== prevEdges) { set({ edges: cleanedEdges, connectedHandles: computeConnectedHandles(cleanedEdges) }); } },
  onConnect: (connection) => { const { edges } = get(); const newEdge = makeEdge({ source: connection.source!, target: connection.target!, sourceHandle: connection.sourceHandle ?? 'done', targetHandle: connection.targetHandle ?? 'input' }); const newEdges = addEdge(newEdge, edges); set({ edges: newEdges, connectedHandles: computeConnectedHandles(newEdges) }); },
  addNode: (node, shouldConnect = true) => {
    const { nodes, edges } = get();
    const newNode = { ...node, data: { ...node.data, outputs: getOutputsForNode(node) } };
    let newEdges = edges;
    const previousNode = nodes.at(-1);
    if (shouldConnect && previousNode && !isTriggerNode(newNode)) {
      newEdges = addEdge(makeEdge({ source: previousNode.id, target: newNode.id, sourceHandle: 'done', targetHandle: getTargetHandleForNode(newNode) }), newEdges);
    }
    const loopHandle = getSelfLoopHandle(newNode);
    if (loopHandle) {
      queueMicrotask(() => {
        const { edges: curEdges } = get();
        const selfEdge = makeEdge({ source: newNode.id, target: newNode.id, sourceHandle: loopHandle, targetHandle: getTargetHandleForNode(newNode) });
        const updatedEdges = addEdge(selfEdge, curEdges);
        set({ edges: updatedEdges, connectedHandles: computeConnectedHandles(updatedEdges) });
      });
    }
    set({ nodes: [...nodes, newNode], edges: newEdges, connectedHandles: computeConnectedHandles(newEdges) });
  },
  addNodeAfter: (node, sourceNodeId, sourceHandleId = 'done') => {
    const { nodes, edges } = get();
    const newNode: any = { ...node, data: { ...node.data, backend_id: null, outputs: getOutputsForNode(node) } };
    const filtered = edges.filter((e) => !(e.source === sourceNodeId && e.sourceHandle === sourceHandleId));
    const newEdges = [...filtered, makeEdge({ source: sourceNodeId, target: newNode.id, sourceHandle: sourceHandleId, targetHandle: getTargetHandleForNode(newNode) })].filter(Boolean) as Edge[];
    set({ nodes: [...nodes, newNode], edges: newEdges, connectedHandles: computeConnectedHandles(newEdges) });
  },
  addNodeBetweenEdge: (node) => {
    const { nodes, edges, sourceEdgeId } = get();
    if (!sourceEdgeId) return;
    const edge = edges.find((e) => e.id == sourceEdgeId);
    if (!edge) return;
    const newNode: any = { ...node, data: { ...node.data, outputs: getOutputsForNode(node) } };
    let newEdges = edges.filter((e) => e.id !== sourceEdgeId);
    if (isTriggerNode(newNode)) { set({ nodes: [...nodes, newNode], edges: newEdges, sourceEdgeId: null, showSidebar: false }); return; }
    const edgeToNew = makeEdge({ source: edge.source, target: newNode.id, sourceHandle: edge.sourceHandle ?? 'done', targetHandle: getTargetHandleForNode(newNode) });
    const edgeFromNew = makeEdge({ source: newNode.id, target: edge.target, sourceHandle: getOutputsForNode(newNode)[0], targetHandle: edge.targetHandle ?? 'input' });
    newEdges.push(edgeToNew, edgeFromNew);
    set({ nodes: [...nodes, newNode], edges: newEdges, connectedHandles: computeConnectedHandles(newEdges), sourceEdgeId: null, showSidebar: false });
  },
  renameNode: (id, newName) => set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, name: newName } } : n)) })),
  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    const deletedNode = nodes.find((n) => n.id === nodeId);
    const isLoop = deletedNode?.data?.type === 'loop';
    const incoming = edges.filter((e) => e.target === nodeId);
    const outgoing = edges.filter((e) => e.source === nodeId);
    let updatedEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    if (isLoop) {
      const childNodes = nodes.filter((n) => n.parentNode === nodeId);
      const childIds = new Set(childNodes.map((n) => n.id));
      updatedEdges = updatedEdges.filter((e) => !(e.source === nodeId || e.target === nodeId));
      updatedEdges = updatedEdges.filter((e) => !(childIds.has(e.source) && e.target === nodeId));
    } else {
      if (incoming.length > 0 && outgoing.length > 0) {
        const reconnected = incoming.map((inE) => { const outE = outgoing[0]; return makeEdge({ source: inE.source, target: outE.target, sourceHandle: inE.sourceHandle ?? 'done', targetHandle: outE.targetHandle ?? 'input' }); });
        updatedEdges = [...updatedEdges, ...reconnected];
      }
    }
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const valid = new Set(updatedNodes.map((n) => n.id));
    const cleanedEdges = updatedEdges.filter((e) => valid.has(e.source) && valid.has(e.target));
    set({ nodes: updatedNodes, edges: cleanedEdges, connectedHandles: computeConnectedHandles(cleanedEdges, updatedNodes) });
  },
  setEdgeForSidebar: (edgeId, sourceNodeId) => set({ sourceEdgeId: edgeId, sourceNodeId, showSidebar: true }),
  clearSource: () => set({ sourceNodeId: null, sourceHandleId: null, sourceEdgeId: null }),
  clearAll: () => set({ nodes: [], edges: [], connectedHandles: {} }),
}));
