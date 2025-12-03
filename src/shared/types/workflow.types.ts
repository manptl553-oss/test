// src/core/types/workflow.types.ts

export interface WorkflowNode {
  id: string;
  name: string;
  type: string; // NodeTypeProps as string to avoid circular dependency
  parentNode?: string;
  parentId?: string | null;
  templateId?: string;
  versionId: string;
  description?: string;
  retryAttempts: number;
  retryDelayMs: number;
  position?: { x: number; y: number };
  config?: any;
  data?: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  condition?: string;
<<<<<<< HEAD
  type?: string;
  animated?: boolean;
  group_id?: string;
  data?: any;
  markerEnd?: { type: string; width: number; height: number };
  style?: { strokeWidth: number };
=======
  groupId?: string | null;
  expression: string;
}

export interface VersionData {
  id: string;
  name: string;
  workflowId: string;
  version: number;
  status: string;
  publishedBy: string;
  updatedBy: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
}

export interface Workflow {
  id: string;
  name: string;
<<<<<<< HEAD
  versionId: string;
=======
  slug?: string;
  version: VersionData;
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  description?: string;
  enabled: boolean;
  lastModified?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export interface WorkflowResponse {
  data: Workflow[];
}

export interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    enabled?: boolean;
  };
  onDelete?: (id: string) => void;
  onOpen: () => void;
}
<<<<<<< HEAD
=======

export interface GroupIds {
  id: string;
  name: string;
}
export type NodeExecutionEvent = Record<string, Record<string, unknown>>;

export interface SaveWorkFlowPayload {
  versionId: string;
  name: string;
  description?: string;
  slug?: string;

  nodes: WorkflowNode[];
  edges: WorkflowEdge[];

  deletedNodes: string[];
  deletedEdges: string[];
}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
