import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { createWorkflowService } from "../api/service";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import { useFlowStore } from "@/core/store/useWorkflowStore";
import { useWorkflowContext } from "@/public";

export function WorkflowBuilder({ workflowId }: { workflowId?: string }) {
  const { api } = useWorkflowContext();
  const service = useMemo(() => createWorkflowService(api), [api]);
  const setWorkflowId = useFlowStore((s) => s.setWorkflowId);
  const [workflow, setWorkflow] = useState<any>(null);

  useEffect(() => {
    if (!workflowId) return;
    setWorkflowId(workflowId);
    service
      .fetchWorkflow(workflowId)
      .then((data: any) => {
        const normalized = normalizeWorkflowData(data);
        setWorkflow(normalized);
      })
      .catch(() => {});
  }, [workflowId]);

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <ReactFlowProvider>
        <div className="relative w-full h-[calc(100vh_-_90px)] overflow-hidden bg-white">
          <FlowCanvas workflow={workflow} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
