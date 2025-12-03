import {
  EAuthType,
  getEdgeLabelForNode,
  getNodeDefinition,
} from "@/shared";
import {
  Workflow,
  WorkflowEdge,
  WorkflowNode,
} from "@/shared/types/workflow.types";
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

    const sourceNode = workflow.nodes?.find((n) => n.id === edge.source);
    const targetNode = workflow.nodes?.find((n) => n.id === edge.target);
    const sourceType = sourceNode?.type?.toLowerCase?.();

    const sourceDef = getNodeDefinition(sourceType);
    const outputs = sourceDef.outputs || [];

    let sourceHandle = edge.sourceHandle;

    //  Loop node handling (handles both parentNode & group_id cases)
    if (sourceType === "loop") {
      const isLoopBody =
<<<<<<< HEAD
        targetNode?.parent_id === sourceNode?.id ||
        edge.group_id === sourceNode?.id;
=======
        targetNode?.parentId === sourceNode?.id ||
        edge.groupId === sourceNode?.id;
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

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

    const targetHandle = edge.targetHandle || "input";

    const label = getEdgeLabelForNode({ data: sourceNode }, sourceHandle);

    return {
      ...edge,
      sourceHandle,
      targetHandle,
      type: edge.type || "custom",
      animated: true,
      data: { label },
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
<<<<<<< HEAD
  if (sourceHandle === "true") return "on_true";
  if (sourceHandle === "false") return "on_false";
  if (sourceHandle.startsWith("case_")) return sourceHandle;
=======
  if (
    sourceHandle.startsWith("case_") ||
    sourceHandle == "on_true" ||
    sourceHandle == "on_false"
  )
    return sourceHandle;
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  return "none";
}

// 3. Transform a single node
export function transformNode(node: Node<NodeData>): WorkflowNode {
  const nodeData = node?.data;

<<<<<<< HEAD
=======
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
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  return {
    id: nodeData?.id, // Use the id from data
    versionId: nodeData.versionId,
    name: nodeData.name,
    description: nodeData?.description || "",
    type: nodeData.type,
    parentId: nodeData.parentLoop || null,
    templateId: nodeData.templateId, // Already present in your node
    config: nodeData.configuration || {},
    retryAttempts: 0,
    retryDelayMs: 0,
    position: {
      x: node?.position.x,
      y: node?.position.y,
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
