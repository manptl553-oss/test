// src/core/types/workflow.types.ts

export interface WorkflowNode {
  id: string;
  name: string;
  type: string; // NodeTypeProps as string to avoid circular dependency
  parentNode?: string;
  parent_id?: string | null;
  position?: { x: number; y: number };
  config?: any;
  data?: any;
}

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  versionId: string;
  condition?: string;
  groupId?: string;
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
}

export interface Workflow {
  id: string;
  name: string;
  slug?:string
  version: VersionData;
  description?: string;
  enabled?: boolean;
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

export interface GroupIds {
  id: string;
  name: string;
}
