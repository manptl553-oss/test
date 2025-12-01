import {
  EAuthType,
  getEdgeLabelForNode,
  getNodeDefinition,
  HTTP_METHODS,
} from "@/shared";
import { Workflow, WorkflowEdge, WorkflowNode } from "@/shared/types/workflow.types";
import { NodeData } from "@/store";
import { Edge, Node } from "reactflow";

/**
 *  normalizeWorkflowData
 * - Works for Add & Edit seamlessly
 * - Dynamically derives handles from backend data
 * - Supports loop detection using parentNode or group_id
 */
export const normalizeWorkflowData = (workflow: Workflow): Workflow => {
  if (!workflow?.edges?.length) return workflow;

  const normalizedEdges: WorkflowEdge[] = workflow.edges.map((edge) => {
    const condition = edge.condition?.toLowerCase?.() ?? "";
    const cleanCondition = condition.replace(/^on_/, "").trim();

    const sourceNode = workflow.nodes?.find((n) => n.id === edge.sourceId);
    const targetNode = workflow.nodes?.find((n) => n.id === edge.targetId);
    const sourceType = sourceNode?.type?.toLowerCase?.();

    const sourceDef = getNodeDefinition(sourceType);
    const outputs = sourceDef.outputs || [];

    let sourceHandle = edge.condition;

    //  Loop node handling (handles both parentNode & group_id cases)
    if (sourceType === "loop") {
      const isLoopBody =
        targetNode?.parentId === sourceNode?.id ||
        edge.groupId === sourceNode?.id;

      if (isLoopBody) sourceHandle = "body";
      else sourceHandle = "end";
    }

    // For other node types (fallback to current logic)
    else if (!sourceHandle) {
      if (outputs.includes(cleanCondition)) {
        sourceHandle = cleanCondition;
      } else {
        const matched = outputs.find((out) =>
          cleanCondition.includes(out.toLowerCase())
        );
        sourceHandle = matched || outputs[0] || "none";
      }
    }

    const targetHandle = "input";

    const label = getEdgeLabelForNode({ data: sourceNode }, sourceHandle);
    const expression = edge?.expression;

    return {
      ...edge,
      sourceHandle,
      targetHandle,
      type: "custom",
      animated: true,
      data: { expression, label },
      label,
    };
  });

  return {
    ...workflow,
    edges: normalizedEdges,
  };
};

function mapHandleToCondition(sourceHandle: string | null | undefined): string {
  if (
    !sourceHandle ||
    sourceHandle === "next" ||
    sourceHandle === "done" ||
    sourceHandle === "success"
  ) {
    return "none";
  }
  if (sourceHandle === "true" || sourceHandle == "on_true") return "on_true";
  if (sourceHandle === "false" || sourceHandle == "on_false") return "on_false";
  if (sourceHandle.startsWith("case_")) return sourceHandle;
  return "none";
}

// 3. Transform a single node
export function transformNode(node: Node<NodeData>): WorkflowNode {
  const nodeData = node?.data;

  const nodeConfiguration = nodeData?.configuration ?? {};
  if (nodeData.type == "membership_invite") {
    nodeConfiguration["appName"] = "KYC";
    nodeConfiguration["roleIds"] = [17];
  }
  if (nodeData.type == "webhook") {
    nodeConfiguration["method"] = "POST";
    nodeConfiguration["authentication"] = {
      type: EAuthType.NONE,
    };
  }
  return {
    id: nodeData?.id,
    versionId: nodeData?.versionId ?? "",
    name: nodeData.name,
    description: nodeData?.description ?? "",
    type: nodeData.type,
    parentId: nodeData.parentLoop ?? null,
    templateId: nodeData?.templateId ?? "", // Already present in your node
    config: nodeData?.configuration ?? {},
    retryAttempts: 0,
    retryDelayMs: 0,
    position: {
      x: Number(node?.position.x),
      y: Number(node?.position.y),
    },
  };
}

// 4. Transform a single edge
export function transformEdge(edge: Edge): WorkflowEdge {
  return {
    id: edge.id,
    versionId: edge.data.versionId,
    sourceId: edge.source, // Use source directly (it's already the node's data.id)
    targetId: edge.target, // Use target directly
    groupId: null,
    condition: mapHandleToCondition(edge.sourceHandle),
    expression: edge?.data?.expression ?? "",
  };
}
