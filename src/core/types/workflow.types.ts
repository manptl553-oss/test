// src/core/types/workflow.types.ts

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;                     // NodeTypeProps as string to avoid circular dependency
  parentNode?: string;
  parent_id?: string | null;
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
  type?: string;
  animated?: boolean;
  group_id?: string;
  data?: any;
  markerEnd?: { type: string; width: number; height: number };
  style?: { strokeWidth: number };
}

export interface Workflow {
  id: string;
  name: string;
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