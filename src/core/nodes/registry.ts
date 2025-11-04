export type NodeDefinition = { outputs: string[]; defaultTarget: string; selfLoopHandle?: string; labels?: Record<string, string>; };

export const NODE_DEFINITIONS: Record<string, NodeDefinition> = {
  webhook: { outputs: ['next'], defaultTarget: 'input' },
  event: { outputs: ['next'], defaultTarget: 'input' },
  schedule: { outputs: ['next'], defaultTarget: 'input' },
  http_request: { outputs: ['next'], defaultTarget: 'input' },
  send_email: { outputs: ['success'], defaultTarget: 'input' },
  send_http_request: { outputs: ['success'], defaultTarget: 'input' },
  update_database: { outputs: ['done'], defaultTarget: 'input' },
  map: { outputs: ['done'], defaultTarget: 'input' },
  rename: { outputs: ['done'], defaultTarget: 'input' },
  remove: { outputs: ['done'], defaultTarget: 'input' },
  copy: { outputs: ['done'], defaultTarget: 'input' },
  filter: { outputs: ['done'], defaultTarget: 'input' },
  aggregate: { outputs: ['done'], defaultTarget: 'input' },
  group: { outputs: ['done'], defaultTarget: 'input' },
  concat: { outputs: ['done'], defaultTarget: 'input' },
  formula: { outputs: ['done'], defaultTarget: 'input' },
  convert_type: { outputs: ['done'], defaultTarget: 'input' },
  merge: { outputs: ['done'], defaultTarget: 'input-1' },
  split: { outputs: ['item'], defaultTarget: 'input', labels: { item: 'Each Item' } },
  date_format: { outputs: ['done'], defaultTarget: 'input' },
  date_operation: { outputs: ['done'], defaultTarget: 'input' },
  timestamp: { outputs: ['done'], defaultTarget: 'input' },
  conditional: { outputs: ['true', 'false'], defaultTarget: 'input', labels: { true: 'True', false: 'False' } },
  switch: { outputs: ['case_1'], defaultTarget: 'input', labels: { case_1: 'Case 1' } },
  loop: { outputs: ['body', 'end'], defaultTarget: 'input', selfLoopHandle: 'body', labels: { body: 'Loop Body', end: 'Loop End' } },
  rule_executor: { outputs: ['true', 'false'], defaultTarget: 'input', labels: { true: 'True', false: 'False' } },
  code_block: { outputs: ['done'], defaultTarget: 'input' },
};
export const getNodeDefinition = (type?: string): NodeDefinition => {
  const key = type?.toLowerCase?.() ?? 'default'; return NODE_DEFINITIONS[key] || { outputs: ['done'], defaultTarget: 'input' };
};
export const getOutputsForNode = (node: any): string[] => {
  const type = node?.data?.type?.toLowerCase(); const def = getNodeDefinition(type);
  if (type === 'switch') {
    const cases = node?.data?.configuration?.switch_cases;
    if (Array.isArray(cases) && cases.length > 0) return cases.map((c: any, i: number) => c?.condition || `case_${i + 1}`);
    return ['case_1'];
  }
  return def.outputs;
};
export const getTargetHandleForNode = (node: any): string => getNodeDefinition(node?.data?.type).defaultTarget;
export const getSelfLoopHandle = (node: any): string | null => getNodeDefinition(node?.data?.type).selfLoopHandle ?? null;
export const getEdgeLabelForNode = (_node: any, handle?: string): string | undefined => {
  if (!handle) return; const normalized = handle.toLowerCase().replace(/^on_/, '');
  const def = getNodeDefinition(_node?.data?.type);
  const staticLabel = def.labels?.[normalized]; if (staticLabel) return staticLabel;
  if (normalized.startsWith('case_')) { const num = normalized.split('_')[1]; return `Case ${num}`; }
  return undefined;
};
export const isTriggerNode = (node?: any): boolean => {
  if (!node) return false; const type = node?.data?.type?.toLowerCase?.(); return ['trigger', 'webhook', 'schedule', 'event', 'cron'].includes(type);
};
