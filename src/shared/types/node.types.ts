// src/core/types/node.types.ts

import { NodeTypeProps } from "../constants";

export type NodeType =
  | "default"
  | "conditional"
  | "loop"
  | "router"
  | "start"
  | "end";

export type ConditionalOutput =
  | "true"
  | "false"
  | "default"
  | "route1"
  | "route2"
  | "route3";


// Sidebar & UI Node Listing Types
export interface NodeProperty {
  id: string;
  name: string;
  icon: any;
  type: NodeTypeProps | string;
  prev_node_id?: string;
}

export interface NodeCategory {
  id: string;
  name: string;
  properties: NodeProperty[];
}

// (Optional) Modal Props (if used everywhere)
export interface NodeConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
}

export interface NodeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNodeId?: string | null;
}

export type NodeDefinition = {
  outputs: string[];
  defaultTarget: string;
  selfLoopHandle?: string;
  labels?: Record<string, string>;
};

export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"].map(
  (m) => ({
    label: m,
    value: m,
  })
);



export enum NodeExecutionStatus {
  Running = "started",
  Completed = "completed",
  Failed = "failed",
}
