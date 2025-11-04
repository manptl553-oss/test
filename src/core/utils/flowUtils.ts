import type { Edge, Node } from 'reactflow';
import { getEdgeLabelForNode, getTargetHandleForNode } from '../nodes/registry';
export const makeEdge = (params: Partial<Edge>): Edge => {
  const { source, sourceHandle, target } = params;
  return {
    id: params.id || `e-${source}-${target}-${Date.now()}`,
    source: source!, target: target!,
    sourceHandle: sourceHandle || 'done', targetHandle: params.targetHandle || 'input',
    type: params.type || 'custom', animated: true, style: params.style || { strokeWidth: 2 },
    data: { ...params.data, label: getEdgeLabelForNode(params as any, sourceHandle || 'done') },
    label: (params as any)?.data?.label
  };
};
export const computeConnectedHandles = (edges: Edge[], nodes?: Node[]): Record<string, Set<string>> => {
  const map: Record<string, Set<string>> = {};
  for (const e of edges) { if (!e.source) continue; if (!map[e.source]) map[e.source] = new Set(); if (e.sourceHandle) map[e.source].add(e.sourceHandle); }
  if (nodes?.length) { const valid = new Set(nodes.map((n) => n.id)); Object.keys(map).forEach((k) => { if (!valid.has(k)) delete map[k]; }); }
  return map;
};
export const getTargetHandleForNodeSafe = (node: any) => getTargetHandleForNode(node);
