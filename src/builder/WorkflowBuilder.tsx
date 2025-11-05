import { useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { createWorkflowService } from '../api/service';
import FlowCanvas from './components/FlowCanvas';
import { normalizeWorkflowData } from './helpers/normalize';
import { useFlowStore } from '@/core/store/useWorkflowStore';
import { useWorkflowContext } from '@/public';

export function WorkflowBuilder({ workflowId }: { workflowId?: string }) {
  const { api } = useWorkflowContext();
  const service = useMemo(() => createWorkflowService(api), [api]);
  const setWorkflowId = useFlowStore((s) => s.setWorkflowId);
  const [workflow, setWorkflow] = useState<any>(null);

  useEffect(() => {
    if (!workflowId) return;
    setWorkflowId(workflowId);
    service.fetchWorkflow(workflowId).then((data:any) => {
      const normalized = normalizeWorkflowData(data);
      setWorkflow(normalized);
    }).catch(() => {});
  }, [workflowId]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-[600px] bg-white">
        <FlowCanvas workflow={workflow} />
      </div>
    </ReactFlowProvider>
  );
}
