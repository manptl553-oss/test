import { Edge, Node } from "reactflow";
import { useFlowStore } from "@/store";
import { getEdgeLabelForNode, getTargetHandleForNode } from "./node";
import { NodeTypeProps } from "../constants";
import { v4 as uuidv4 } from "uuid";
/** -------------------------------------------------
 *  Create consistent edge object with dynamic label
 * ------------------------------------------------- */
export const makeEdge = (params: Partial<Edge>): Edge => {
  const { source, sourceHandle, target } = params;
  const state = useFlowStore.getState();

  //  Find the source node for label computation
  const sourceNode = state.nodes.find((n) => n.id === source);

  //  Dynamically resolve the label from node definition
  let label: string | undefined;

  if (sourceNode && sourceHandle) {
    label = getEdgeLabelForNode(sourceNode, sourceHandle);
  }

  //  Safety: if the node no longer exists or label invalid → clear it
  if (!sourceNode || !label) label = undefined;

  //just get expression for witch node and set in edge data
  const expression =
    sourceNode?.data?.configuration?.switchCases?.find(
      (e: any) => e.condition === sourceHandle
    )?.expression ?? "";

  return {
    id: params.id || uuidv4(),
    source: source!,
    target: target!,
    sourceHandle: sourceHandle || "none",
    targetHandle: params.targetHandle || "input",
    type: params.type || "custom",
    animated: true,
    style: params.style || { strokeWidth: 2 },
    data: {
      ...params.data,
      label,
      versionId: state.currentVersion?.id,
      expression,
    },
    label, // ReactFlow displays this directly
  };
};

/** -------------------------------------------------
 *  Compute connected handle map (for "+" add logic)
 * ------------------------------------------------- */
export const computeConnectedHandles = (
  edges: Edge[],
  nodes?: Node[]
): Record<string, Set<string>> => {
  const handleMap: Record<string, Set<string>> = {};

  for (const e of edges) {
    if (!e.source || !e.target) continue;
    if (!handleMap[e.source]) handleMap[e.source] = new Set();
    if (e.sourceHandle) handleMap[e.source].add(e.sourceHandle);
  }

  //  Clean handles of deleted nodes (avoid stale refs)
  if (nodes?.length) {
    const validIds = new Set(nodes.map((n) => n.id));
    for (const id of Object.keys(handleMap)) {
      if (!validIds.has(id)) delete handleMap[id];
    }
  }

  return handleMap;
};

/** -------------------------------------------------
 *  Detect parent loop relationship dynamically
 * ------------------------------------------------- */
export const findParentLoop = (
  sourceNode?: Node,
  targetNode?: Node
): string | null => {
  const getType = (n?: any) => n?.data?.type;

  return (
    sourceNode?.data?.parentLoop ||
    targetNode?.data?.parentLoop ||
    (getType(targetNode) === NodeTypeProps.LOOP ? targetNode?.id : null) ||
    (getType(sourceNode) === NodeTypeProps.LOOP ? sourceNode?.id : null)
  );
};

/** -------------------------------------------------
 * Add self-loop edge for loop nodes
 * ------------------------------------------------- */
export const makeLoopEdge = (node: Node): Edge => {
  return makeEdge({
    source: node.id,
    target: node.id,
    sourceHandle: "body",
    targetHandle: getTargetHandleForNode(node),
    style: { stroke: "#f97316", strokeWidth: 2 },
  });
};

export const getEdgeLabel = (source: string | undefined) => {
  switch (source) {
    case "on_true":
      return "true";
    case "on_false":
      return "false";
    case "done":
    case "success":
    case "next":
    case "none":
      return undefined;
    default:
      return source;
  }
};
