import dagre from "dagre";
import { Node, Edge } from "reactflow";

const nodeWidth = 200;
const nodeHeight = 60;

export const getAutoLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  g.setGraph({ rankdir: "LR", ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const { x, y } = g.node(node.id);
    return {
      ...node,
      position: { x, y },
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
};

