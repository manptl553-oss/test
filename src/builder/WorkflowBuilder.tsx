import React, { useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useWorkflowContext } from '../provider/WorkflowProvider';
import { createWorkflowService } from '../api/service';
import { useWorkflowStore } from '../core/store/useWorkflowStore';
import FlowCanvas from './components/FlowCanvas';
import { normalizeWorkflowData } from './helpers/normalize';

export function WorkflowBuilder({ workflowId }: { workflowId?: string }) {
  const { api } = useWorkflowContext();
  const service = useMemo(() => createWorkflowService(api), [api]);
  const setWorkflowId = useWorkflowStore((s) => s.setWorkflowId);
  const [workflow, setWorkflow] = useState<any>(null);

  useEffect(() => {
    if (!workflowId) return;
    setWorkflowId(workflowId);
    service.fetchWorkflow(workflowId).then((data) => {
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
