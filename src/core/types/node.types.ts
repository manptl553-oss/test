// src/core/types/node.types.ts

export type NodeType = "default" | "conditional" | "loop" | "router" | "start" | "end";

export type ConditionalOutput = "true" | "false" | "default" | "route1" | "route2" | "route3";

export interface NodeData {
  label: string;
  type: NodeType;                      // Keep string to avoid circular import with enum
  parameters?: Record<string, any>;
  conditions?: {
    type: string;
    expression: string;
  };
  outputs?: ConditionalOutput[];
}

export enum NodeTypeProps {
  SEND_EMAIL = "send_email",
  SEND_HTTP_REQUEST = "send_http_request",
  UPDATE_DATABASE = "update_database",
  CONDITIONAL = "conditional",
  LOOP = "loop",
  SWITCH = "switch",
  RULE_EXECUTOR = "rule_executor",
  MAP = "map",
  RENAME = "rename",
  REMOVE = "remove",
  COPY = "copy",
  FILTER = "filter",
  AGGREGATE = "aggregate",
  GROUP = "group",
  CONCAT = "concat",
  FORMULA = "formula",
  CONVERT_TYPE = "convert_type",
  MERGE = "merge",
  SPLIT = "split",
  DATE_FORMAT = "date_format",
  DATE_OPERATION = "date_operation",
  TIMESTAMP = "timestamp",
  CODE_BLOCK = "code_block",
  VIP_MEMBERSHIP_INVITE = "vip_membership_invite",
  PEP_CHECK_INVITE = "pep_check_invite",
  HTTP_REQUEST = "http_request",
  WEBHOOK = "webhook",
  EVENT = "event",
  SCHEDULE = "schedule"
}

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
  nodeData: any;
}

export interface NodeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNodeId?: string | null;
}
