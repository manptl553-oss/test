export function normalizeWorkflowData(wf: any) {
  if (!wf) return wf;
  return { id: wf.id, name: wf.name, nodes: wf.nodes || [], edges: wf.edges || [], triggers: wf.triggers || [] };
}
