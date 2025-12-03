import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  EditableNodeName,
  nodeFieldsConfig,
  nodeValidationSchema,
} from "@/shared";
import { useFlowStore } from "@/store";
import { useMemo, useState } from "react";
import { useReactFlow } from "reactflow";
import { DynamicForm } from "./DynamicForm";

export function NodeConfigModal() {
  const { setNodes } = useReactFlow();
  const { activeNode, setActiveNode, updateNode } = useFlowStore(); // Add updateNode from store
  const nodeData = activeNode?.data;
  const nodeId = activeNode?.id as string;
  const ignoredConfig = ["skip", "continueOnError"];

  const isConfigEmpty = !Object.keys(nodeData?.configuration ?? {}).some(
    (k) => !ignoredConfig.includes(k)
  );

  const nodeType = nodeData?.type as string;

  const [nodeName, setNodeName] = useState(
    nodeData?.name || nodeType?.toUpperCase()
  );

  const isTrigger = ["webhook", "event"].includes(nodeType);
  const fields = nodeFieldsConfig[nodeType] ?? [];
  const schema = nodeValidationSchema[nodeType];

  const defaultValues = useMemo(() => {
    const saved = nodeData?.configuration ?? {};
<<<<<<< HEAD
    const result: any = {};
=======
    let result: any = {};
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
    fields.forEach((f: any) => {
      const val = saved[f.name];
      if (f.type === "conditions") {
        result[f.name] = Array.isArray(val) ? val : [];
      } else if (f.type === "cases") {
        result[f.name] = Array.isArray(val) ? val : [];
      } else {
        result[f.name] = val ?? "";
      }
    });
    return result;
  }, [nodeData, nodeType]);

  const handleFormSubmit = async (values: Record<string, any>) => {
    try {
      let finalConfig = { ...values };

      // Process conditions for CONDITIONAL/RULE_EXECUTOR
      if (Array.isArray(values.conditions)) {
        finalConfig.conditions = values.conditions.map(
          (c: any, index: number) => ({
            expression: `'${c.field}' ${c.operator} '${c.value}'`,
            operator: "&&",
          })
        );
      }

      // Process cases for SWITCH
      if (Array.isArray(values.switchCases)) {
        finalConfig.switchCases = values.switchCases.map(
          (c: any, index: number) => ({
            condition: `case_${index + 1}`,
            expression: `'${c.field}' ${c.operator} '${c.value}'`,
          })
        );
      }
      console.log(values, "---------values");
      const payload = {
        type: nodeType,
        name: nodeName,
        configuration: finalConfig,
      };

      // IMPORTANT: Use updateNode from store instead of setNodes
      // This will trigger the branch node/edge creation logic
      if (updateNode) {
        updateNode(nodeId, payload);
      } else {
        // Fallback: direct node update (won't create branches)
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    name: nodeName,
                    configuration: finalConfig,
                  },
                }
              : node
          )
        );
      }
      setActiveNode(null);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  return (
    <Dialog
      open={nodeData ? true : false}
<<<<<<< HEAD
      onOpenChange={() => setActiveNode(null)}
=======
      onOpenChange={() => {
        setActiveNode(null);
      }}
      isModal={isConfigEmpty ? true : false}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
    >
      <DialogContent className="wf-node-config-dialog">
        <DialogHeader className="wf-node-config-header">
          <DialogTitle className="wf-node-config-title">
            <EditableNodeName
              nodeName={nodeName}
              onRename={(val: string) => setNodeName(val)}
            />
          </DialogTitle>
        </DialogHeader>
        <DynamicForm
          key={nodeId}
          fields={fields as any}
          defaultValues={defaultValues}
          onSubmit={handleFormSubmit}
          schema={schema as any}
          onClose={() => {
            setActiveNode(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

NodeConfigModal.displayName = "NodeConfigModal";
