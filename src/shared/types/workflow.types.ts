// src/core/types/workflow.types.ts

import { NodeData } from "@/store";
import { Edge, Node } from "reactflow";

export interface WorkflowNode {
  id: string;
  name: string;
  type: string; // NodeTypeProps as string to avoid circular dependency
  parentNode?: string;
  parentId?: string | null;
  position?: { x: number; y: number };
  config?: any;
  data?: any;
  versionId?:string;
  description?:string;
  templateId?:string;
  retryAttempts?:number;
  retryDelayMs?:number;
}

export interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
  versionId: string;
  condition?: string;
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
}

export interface Workflow {
  id: string;
  name: string;
  slug?: string;
  version: VersionData;
  description?: string;
  enabled?: boolean;
  lastModified?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
    deletedNodes?: string[];
  deletedEdges?: string[];
  versionId?:string
  triggers?:[]
}


export interface SaveWorkflowPayload {
  versionId: string;
  description?: string;
  slug?: string;
  nodes?: any;
  edges?: any;
  deletedNodes?: string[];
  deletedEdges?: string[];
  name?:string
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
export type NodeExecutionEvent = Record<string, Record<string, unknown>>;
