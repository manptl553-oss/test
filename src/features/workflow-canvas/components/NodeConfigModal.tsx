import { useMemo, useState } from "react";
import { useReactFlow } from "reactflow";
import { DynamicForm } from "./DynamicForm";
import { useFlowStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  EditableNodeName,
  nodeFieldsConfig,
  nodeValidationSchema,
} from "@/shared";

export const getSourceHandle = (sourceHandle: string | undefined) => {
  switch (sourceHandle) {
    case "true":
      return "on_true";
    case "false":
      return "on_false";
    default:
      return sourceHandle;
  }
};
export function NodeConfigModal() {
  const { setNodes, getEdges } = useReactFlow();
  const { activeNode, setActiveNode } = useFlowStore();
  const nodeData = activeNode?.data;
  const nodeId = nodeData?.id;
  const nodeType = nodeData?.type as string;
  const [nodeName, setNodeName] = useState(
    nodeData?.name || nodeType?.toUpperCase()
  );
  const incomingEdge = getEdges().find((e) => e.target === nodeId);
  const prevNodeId = ["webhook", "event"].includes(
    incomingEdge?.data?.prev_node_type
  )
    ? null
    : incomingEdge?.data?.prev_node_id ?? null;
  const outgoingEdge = getEdges().find((e) => e.source === nodeId);
  const nextNodeId = outgoingEdge?.data?.next_node_id;
  const isConditional =
    nodeType === "conditional" || nodeType === "rule_executor";
  const isSwitch = nodeType === "switch";
  const isTrigger = ["webhook", "event"].includes(nodeType);
  const isFormNode = !isConditional && !isSwitch;
  const fields = nodeFieldsConfig[nodeType] ?? [];
  const schema = nodeValidationSchema[nodeType];
  const defaultValues = useMemo(() => {
    if (!isFormNode) return {};
    const saved =
      (isTrigger
        ? nodeData?.configuration?.[nodeType]
        : nodeData?.configuration) ?? {};
    const result: any = {};
    fields.forEach((f: any) => {
      const val = saved[f.name];
      result[f.name] = val ?? "";
    });
    return result;
  }, [nodeData, nodeType]);
  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      const payload = {
        type: nodeType,
        name: nodeName,
        configuration: isTrigger ? { [nodeType]: values } : values,
        // ...(!nodeData.backend_id && prevNodeId && { prev_node_id: prevNodeId }),
        // ...(!nodeData.backend_id && nextNodeId && { next_node_id: nextNodeId }),
      };
      // const resp = await service.saveNode(nodeData?.backend_id || null, { workflow_id: workflowId, ...payload });
      // (nodeData as any).backend_id = (resp as any)?.data?.data?.id || (nodeData as any).backend_id;
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: { ...node.data, name: nodeName, configuration: values },
              }
            : node
        )
      );
      setActiveNode(null);
    } catch (e) {
      console.error("Save failed", e);
    }
  };
  return (
    <Dialog
      open={nodeData ? true : false}
      onOpenChange={() => setActiveNode(null)}
    >
      <DialogContent className="sm:max-w-[750px] bg-white rounded-xl shadow-xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="font-semibold text-lg text-gray-800">
            <EditableNodeName
              nodeName={nodeName}
              onRename={(val: string) => setNodeName(val)}
            />
          </DialogTitle>
        </DialogHeader>

        {isFormNode ? (
          <DynamicForm
            key={nodeId}
            fields={fields as any}
            defaultValues={defaultValues}
            onSubmit={handleFormSubmit}
            schema={schema as any}
            onClose={() => setActiveNode(null)}
          />
        ) : (
          <div className="p-4 text-sm text-gray-600">
            Custom UI for conditional/switch is not included.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
NodeConfigModal.displayName = "NodeConfigModal";
