import {
  Mail,
  Bell,
  Database,
  GitBranch,
  Repeat,
  Shuffle,
  MapIcon,
  Edit3,
  Trash2,
  Copy,
  Filter,
  Calculator,
  Group,
  Combine,
  FunctionSquare,
  Code2,
  Type,
  Merge,
  Split,
  CalendarPlus,
  CalendarClock,
  Clock3,
  Star,
  Share2,
  Scissors,
  Globe,
  Webhook,
  Bolt,
  Building,
  IdCard,
  Settings,
  Settings2,
  Zap,
} from "lucide-react";
import { NodeDefinition } from "../types";

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
  SCHEDULE = "schedule",
}

export enum NodeIconTypeProps {
  TRIGGER = "trigger",
  ACTION = "action",
  DATA_TRANSFORM = "data_transform",
  FLOW_CONTROL = "flow_control",
  UTILITIES = "utilities",
  GENERAL = "general",
  KYC = "kyc",
  KYB = "kyb",
}

export const nodeTypeStyles: Record<
  NodeTypeProps | NodeIconTypeProps,
  {
    icon: any;
    bg: string; // HEX background
    border: string; // HEX border
  }
> = {
  // ============================
  // NODE TYPES
  // ============================

  [NodeTypeProps.SEND_EMAIL]: {
    icon: Mail,
    bg: "#3b82f6", // blue-500
    border: "#1d4ed8", // blue-700
  },
  [NodeTypeProps.SEND_HTTP_REQUEST]: {
    icon: Bell,
    bg: "#f97316", // orange-500
    border: "#c2410c", // orange-700
  },
  [NodeTypeProps.UPDATE_DATABASE]: {
    icon: Database,
    bg: "#a855f7", // purple-500
    border: "#6b21a8", // purple-700
  },
  [NodeTypeProps.CONDITIONAL]: {
    icon: GitBranch,
    bg: "#ca8a04", // yellow-600
    border: "#a16207", // yellow-700
  },
  [NodeTypeProps.LOOP]: {
    icon: Repeat,
    bg: "#16a34a", // green-600
    border: "#15803d", // green-700
  },
  [NodeTypeProps.SWITCH]: {
    icon: Shuffle,
    bg: "#4f46e5", // indigo-600
    border: "#3730a3", // indigo-700
  },
  [NodeTypeProps.MAP]: {
    icon: MapIcon,
    bg: "#2563eb", // blue-600
    border: "#1d4ed8", // blue-700
  },
  [NodeTypeProps.RENAME]: {
    icon: Edit3,
    bg: "#4b5563", // gray-600
    border: "#374151", // gray-700
  },
  [NodeTypeProps.REMOVE]: {
    icon: Trash2,
    bg: "#dc2626", // red-600
    border: "#b91c1c", // red-700
  },
  [NodeTypeProps.COPY]: {
    icon: Copy,
    bg: "#0d9488", // teal-600
    border: "#0f766e", // teal-700
  },
  [NodeTypeProps.FILTER]: {
    icon: Filter,
    bg: "#059669", // emerald-600
    border: "#047857", // emerald-700
  },
  [NodeTypeProps.AGGREGATE]: {
    icon: Calculator,
    bg: "#db2777", // pink-600
    border: "#be185d", // pink-700
  },
  [NodeTypeProps.GROUP]: {
    icon: Group,
    bg: "#7c3aed", // violet-600
    border: "#5b21b6", // violet-700
  },
  [NodeTypeProps.CONCAT]: {
    icon: Combine,
    bg: "#d97706", // amber-600
    border: "#b45309", // amber-700
  },
  [NodeTypeProps.FORMULA]: {
    icon: FunctionSquare,
    bg: "#0284c7", // sky-600
    border: "#0369a1", // sky-700
  },
  [NodeTypeProps.CODE_BLOCK]: {
    icon: Code2,
    bg: "#3f3f46", // zinc-700
    border: "#27272a", // zinc-800
  },
  [NodeTypeProps.CONVERT_TYPE]: {
    icon: Type,
    bg: "#e11d48", // rose-600
    border: "#be123c", // rose-700
  },
  [NodeTypeProps.MERGE]: {
    icon: Merge,
    bg: "#4338ca", // indigo-700
    border: "#312e81", // indigo-800
  },
  [NodeTypeProps.SPLIT]: {
    icon: Split,
    bg: "#c026d3", // fuchsia-600
    border: "#a21caf", // fuchsia-700
  },
  [NodeTypeProps.DATE_FORMAT]: {
    icon: CalendarPlus,
    bg: "#ef4444", // red-500
    border: "#b91c1c", // red-700
  },
  [NodeTypeProps.DATE_OPERATION]: {
    icon: CalendarClock,
    bg: "#f59e0b", // amber-500
    border: "#b45309", // amber-700
  },
  [NodeTypeProps.TIMESTAMP]: {
    icon: Clock3,
    bg: "#1d4ed8", // blue-700
    border: "#1e3a8a", // blue-800
  },
  [NodeTypeProps.VIP_MEMBERSHIP_INVITE]: {
    icon: Star,
    bg: "#eab308", // yellow-500
    border: "#a16207", // yellow-700
  },
  [NodeTypeProps.PEP_CHECK_INVITE]: {
    icon: Share2,
    bg: "#14b8a6", // teal-500
    border: "#0f766e", // teal-700
  },
  [NodeTypeProps.RULE_EXECUTOR]: {
    icon: Scissors,
    bg: "#b91c1c", // red-700
    border: "#7f1d1d", // red-800
  },
  [NodeTypeProps.HTTP_REQUEST]: {
    icon: Globe,
    bg: "#15803d", // green-700
    border: "#166534", // green-800
  },
  [NodeTypeProps.WEBHOOK]: {
    icon: Webhook,
    bg: "#6b21a8", // purple-700
    border: "#581c87", // purple-800
  },
  [NodeTypeProps.EVENT]: {
    icon: Bolt,
    bg: "#3b82f6", // blue-500
    border: "#1d4ed8", // blue-700
  },
  [NodeTypeProps.SCHEDULE]: {
    icon: CalendarClock,
    bg: "#6366f1", // indigo-500
    border: "#4338ca", // indigo-700
  },

  // ============================
  // MAIN CATEGORIES
  // ============================

  [NodeIconTypeProps.TRIGGER]: {
    icon: Bolt,
    bg: "#eab308", // yellow-500
    border: "#a16207", // yellow-700
  },
  [NodeIconTypeProps.ACTION]: {
    icon: Zap,
    bg: "#2563eb", // blue-600
    border: "#1d4ed8", // blue-700
  },
  [NodeIconTypeProps.DATA_TRANSFORM]: {
    icon: Shuffle,
    bg: "#9333ea", // purple-600
    border: "#7e22ce", // purple-700
  },
  [NodeIconTypeProps.FLOW_CONTROL]: {
    icon: GitBranch,
    bg: "#4f46e5", // indigo-600
    border: "#3730a3", // indigo-700
  },
  [NodeIconTypeProps.UTILITIES]: {
    icon: Settings,
    bg: "#4b5563", // gray-600
    border: "#374151", // gray-700
  },

  // ============================
  // SUBCATEGORIES
  // ============================

  [NodeIconTypeProps.GENERAL]: {
    icon: Settings2,
    bg: "#78716c", // stone-500
    border: "#44403c", // stone-700
  },
  [NodeIconTypeProps.KYC]: {
    icon: IdCard,
    bg: "#0d9488", // teal-600
    border: "#0f766e", // teal-700
  },
  [NodeIconTypeProps.KYB]: {
    icon: Building,
    bg: "#d97706", // amber-600
    border: "#b45309", // amber-700
  },
};

export const NODE_DEFINITIONS: Record<NodeTypeProps, NodeDefinition> = {
  webhook: { outputs: ["none"], defaultTarget: "input" },
  event: { outputs: ["none"], defaultTarget: "input" },
  schedule: { outputs: ["none"], defaultTarget: "input" },
  http_request: { outputs: ["none"], defaultTarget: "input" },

  send_email: { outputs: ["none"], defaultTarget: "input" },
  send_http_request: { outputs: ["none"], defaultTarget: "input" },
  update_database: { outputs: ["none"], defaultTarget: "input" },
  vip_membership_invite: { outputs: ["none"], defaultTarget: "input" },
  pep_check_invite: { outputs: ["none"], defaultTarget: "input" },

  map: { outputs: ["none"], defaultTarget: "input" },
  rename: { outputs: ["none"], defaultTarget: "input" },
  remove: { outputs: ["none"], defaultTarget: "input" },
  copy: { outputs: ["none"], defaultTarget: "input" },
  filter: { outputs: ["none"], defaultTarget: "input" },
  aggregate: { outputs: ["none"], defaultTarget: "input" },
  group: { outputs: ["none"], defaultTarget: "input" },
  concat: { outputs: ["none"], defaultTarget: "input" },
  formula: { outputs: ["none"], defaultTarget: "input" },
  convert_type: { outputs: ["none"], defaultTarget: "input" },

  merge: { outputs: ["none"], defaultTarget: "input-1" },

  split: {
    outputs: ["item"],
    defaultTarget: "input",
    labels: { item: "Each Item" },
  },

  date_format: { outputs: ["none"], defaultTarget: "input" },
  date_operation: { outputs: ["none"], defaultTarget: "input" },
  timestamp: { outputs: ["none"], defaultTarget: "input" },

  conditional: {
    outputs: ["true", "false"],
    defaultTarget: "input",
    labels: { true: "True", false: "False" },
  },

  switch: {
    outputs: ["case_1"],
    defaultTarget: "input",
    labels: { case_1: "Case 1" },
  },

  loop: {
    outputs: ["body", "end"],
    defaultTarget: "input",
    selfLoopHandle: "body",
    labels: { body: "Loop Body", end: "Loop End" },
  },

  rule_executor: {
    outputs: ["true", "false"],
    defaultTarget: "input",
    labels: { true: "True", false: "False" },
  },

  code_block: { outputs: ["none"], defaultTarget: "input" },
};
