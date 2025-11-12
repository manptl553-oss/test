import { NODE_DEFINITIONS } from "../constants";
import { NodeDefinition } from "../types";

export const getNodeDefinition = (type?: string): NodeDefinition => {
  const key = type?.toLowerCase?.();
  if (!key) {
    return { outputs: ["done"], defaultTarget: "input" };
  }

  return (
    NODE_DEFINITIONS[key as keyof typeof NODE_DEFINITIONS] ?? {
      outputs: ["done"],
      defaultTarget: "input",
    }
  );
};

export const getOutputsForNode = (node: any): string[] => {
  const type = node?.data?.type?.toLowerCase();
  const def = getNodeDefinition(type);

  if (type === "switch") {
    const cases = node?.data?.configuration?.switch_cases;
    if (Array.isArray(cases) && cases.length > 0)
      return cases.map((c: any, i: number) => c?.condition || `case_${i + 1}`);
    return ["case_1"];
  }

  return def.outputs;
};

export const getTargetHandleForNode = (node: any): string =>
  getNodeDefinition(node?.data?.type).defaultTarget;

export const getSelfLoopHandle = (node: any): string | null =>
  getNodeDefinition(node?.data?.type).selfLoopHandle ?? null;

export const getEdgeLabelForNode = (
  node: any,
  handle?: string
): string | undefined => {
  if (!handle) return;
  const normalized = handle.toLowerCase().replace(/^on_/, "");

  const def = getNodeDefinition(node?.data?.type);

  // Static labels
  if (def.labels?.[normalized]) return def.labels[normalized];

  // Dynamic switch case: case_1 → Case 1
  if (normalized.startsWith("case_")) {
    const num = normalized.split("_")[1];
    return `Case ${num}`;
  }

  return undefined;
};

// ✅ Includes old trigger logic + extended support
export const isTriggerNode = (nodeType?: string): boolean => {
  if (!nodeType) return false;
  const type = nodeType.toLowerCase?.();
  return ["webhook", "event", "schedule", "trigger", "cron"].includes(type);
};
