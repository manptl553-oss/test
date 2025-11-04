import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';
const nodeWidth = 200; const nodeHeight = 60;
export function getAutoLayoutedElements(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', ranksep: 120, nodesep: 80 });
  nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  const layoutedNodes = nodes.map((n) => { const { x, y } = g.node(n.id); return { ...n, position: { x, y } }; });
  return { nodes: layoutedNodes, edges };
};
