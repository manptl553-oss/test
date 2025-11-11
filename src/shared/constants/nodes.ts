import {
  Mail, Bell, Database, GitBranch, Repeat, Shuffle, MapIcon, Edit3, Trash2, Copy,
  Filter, Calculator, Group, Combine, FunctionSquare, Code2, Type, Merge, Split,
  CalendarPlus, CalendarClock, Clock3, Star, Share2, Scissors, Globe, Webhook, Bolt
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
  SCHEDULE = "schedule"
}

export const nodeTypeIcons: Record<NodeTypeProps, any> = {
  [NodeTypeProps.SEND_EMAIL]: Mail,
  [NodeTypeProps.SEND_HTTP_REQUEST]: Bell,
  [NodeTypeProps.UPDATE_DATABASE]: Database,
  [NodeTypeProps.CONDITIONAL]: GitBranch,
  [NodeTypeProps.LOOP]: Repeat,
  [NodeTypeProps.SWITCH]: Shuffle,
  [NodeTypeProps.MAP]: MapIcon,
  [NodeTypeProps.RENAME]: Edit3,
  [NodeTypeProps.REMOVE]: Trash2,
  [NodeTypeProps.COPY]: Copy,
  [NodeTypeProps.FILTER]: Filter,
  [NodeTypeProps.AGGREGATE]: Calculator,
  [NodeTypeProps.GROUP]: Group,
  [NodeTypeProps.CONCAT]: Combine,
  [NodeTypeProps.FORMULA]: FunctionSquare,
  [NodeTypeProps.CODE_BLOCK]: Code2,
  [NodeTypeProps.CONVERT_TYPE]: Type,
  [NodeTypeProps.MERGE]: Merge,
  [NodeTypeProps.SPLIT]: Split,
  [NodeTypeProps.DATE_FORMAT]: CalendarPlus,
  [NodeTypeProps.DATE_OPERATION]: CalendarClock,
  [NodeTypeProps.TIMESTAMP]: Clock3,
  [NodeTypeProps.VIP_MEMBERSHIP_INVITE]: Star,
  [NodeTypeProps.PEP_CHECK_INVITE]: Share2,
  [NodeTypeProps.RULE_EXECUTOR]: Scissors,
  [NodeTypeProps.HTTP_REQUEST]: Globe,
  [NodeTypeProps.WEBHOOK]: Webhook,
  [NodeTypeProps.EVENT]: Bolt,
  [NodeTypeProps.SCHEDULE]: CalendarClock,
};


export const NODE_DEFINITIONS: Record<NodeTypeProps, NodeDefinition> = {
  webhook: { outputs: ["next"], defaultTarget: "input" },
  event: { outputs: ["next"], defaultTarget: "input" },
  schedule: { outputs: ["next"], defaultTarget: "input" },
  http_request: { outputs: ["next"], defaultTarget: "input" },

  send_email: { outputs: ["success"], defaultTarget: "input" },
  send_http_request: { outputs: ["success"], defaultTarget: "input" },
  update_database: { outputs: ["done"], defaultTarget: "input" },
  vip_membership_invite: { outputs: ["sent"], defaultTarget: "input" },
  pep_check_invite: { outputs: ["done"], defaultTarget: "input" },

  map: { outputs: ["done"], defaultTarget: "input" },
  rename: { outputs: ["done"], defaultTarget: "input" },
  remove: { outputs: ["done"], defaultTarget: "input" },
  copy: { outputs: ["done"], defaultTarget: "input" },
  filter: { outputs: ["done"], defaultTarget: "input" },
  aggregate: { outputs: ["done"], defaultTarget: "input" },
  group: { outputs: ["done"], defaultTarget: "input" },
  concat: { outputs: ["done"], defaultTarget: "input" },
  formula: { outputs: ["done"], defaultTarget: "input" },
  convert_type: { outputs: ["done"], defaultTarget: "input" },

  merge: { outputs: ["done"], defaultTarget: "input-1" },

  split: {
    outputs: ["item"],
    defaultTarget: "input",
    labels: { item: "Each Item" },
  },

  date_format: { outputs: ["done"], defaultTarget: "input" },
  date_operation: { outputs: ["done"], defaultTarget: "input" },
  timestamp: { outputs: ["done"], defaultTarget: "input" },

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

  code_block: { outputs: ["done"], defaultTarget: "input" },
};