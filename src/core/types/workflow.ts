export type WorkflowNode = {
  id: string;
  name: string;
  type: string;
  position?: { x: number; y: number };
  configuration?: any;
  data?: any;
  backend_id?: string | null;
};
export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: any;
};
export type Workflow = { id: string; name: string; nodes?: WorkflowNode[]; edges?: WorkflowEdge[]; triggers?: any[]; };
