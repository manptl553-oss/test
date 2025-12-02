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
  MEMBERSHIP_INVITE = "membership_invite",
  HTTP_REQUEST = "http_request",
  WEBHOOK = "webhook",
  EVENT = "event",
  SCHEDULE = "schedule",
  WAIT = "wait",
  VOID = "void_node",
}

export enum CategoryTypes {
  TRIGGER = "trigger",
  ACTION = "action",
  DATA_TRANSFORM = "data_transform",
  FLOW_CONTROL = "flow_control",
  UTILITIES = "utilities",
  GENERAL = "general",
  KYC = "kyc",
  KYB = "kyb",
}

export const NODE_DEFINITIONS: Record<NodeTypeProps, NodeDefinition> = {
  webhook: { outputs: ["none"], defaultTarget: "input" },
  event: { outputs: ["none"], defaultTarget: "input" },
  schedule: { outputs: ["none"], defaultTarget: "input" },
  http_request: { outputs: ["none"], defaultTarget: "input" },

  send_email: { outputs: ["none"], defaultTarget: "input" },
  send_http_request: { outputs: ["none"], defaultTarget: "input" },
  update_database: { outputs: ["none"], defaultTarget: "input" },
  membership_invite: { outputs: ["none"], defaultTarget: "input" },

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
    outputs: ["on_true", "on_false"],
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
    outputs: ["on_true", "on_false"],
    defaultTarget: "input",
    labels: { true: "True", false: "False" },
  },

  code_block: { outputs: ["none"], defaultTarget: "input" },

  wait: { outputs: ["none"], defaultTarget: "input" },
  
  void_node: { outputs: ["none"], defaultTarget: "input" },
};
