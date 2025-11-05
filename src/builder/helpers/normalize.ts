import { getEdgeLabelForNode, getNodeDefinition } from "@/core/nodes/registry";
import { Workflow, WorkflowEdge } from "@/core/types/workflow.types";


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
      const isLoopBody = targetNode?.parent_id === sourceNode?.id || edge.group_id === sourceNode?.id;

      if (isLoopBody) sourceHandle = "body";
      else sourceHandle = "end";
    }

    // For other node types (fallback to current logic)
    else if (!sourceHandle) {
      if (outputs.includes(cleanCondition)) {
        sourceHandle = cleanCondition;
      } else {
        const matched = outputs.find((out) => cleanCondition.includes(out.toLowerCase()));
        sourceHandle = matched || outputs[0] || "done";
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
