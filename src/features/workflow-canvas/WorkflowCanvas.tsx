import { Button, Input } from "@/shared";
import { Workflow } from "@/shared/types/workflow.types";
import { useFlowStore } from "@/store/workflow-store";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import "./workflow-canvas.css";
export function WorkflowCanvas({
  workflow,
  handleBack,
  handleUpdateWorkflowMeta,
  handleSaveWorkflow,
}: {
  workflow: Workflow;
  handleBack: () => void;
  handleUpdateWorkflowMeta: () => void;
  handleRunWorkflow: () => void;
  handleSaveWorkflow: (workflow: any) => void;
}) {
  const { getChangesForSync, nodes, setVersionId, versionId } = useFlowStore();
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const normalizedData = useMemo(
    () => (workflow ? normalizeWorkflowData(workflow) : null),
    [workflow]
  );
  const isNameChanged = useMemo(
    () => workflow && workflowName.trim() !== workflow.name.trim(),
    [workflowName, workflow]
  );

  useEffect(() => {
    if (!versionId) setVersionId(workflow.versionId);
  }, [versionId]);

  return (
    <div className="wf-canvas">
      <header className="wf-canvas__header">
        <div className="wf-header-left">
          <button
            onClick={handleBack}
            aria-label="Back"
            className="wf-back-button"
          >
            <ArrowLeft color="black" size={20} />
          </button>

          <div className="wf-name-row">
            <Input
              id="workflow-name"
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name"
              className="wf-workflow-name-input"
            />

            {isNameChanged && (
              <Button
                className="wf-save-btn"
                onClick={handleUpdateWorkflowMeta}
              >
                Save
              </Button>
            )}
          </div>
        </div>

        {nodes?.length > 0 && (
          <div>
            <Button
              className="wf-save-btn"
              onClick={() => {
                const changes = getChangesForSync();
                if (changes)
                  handleSaveWorkflow({
                    ...workflow,
                    ...changes,
                  });
              }}
            >
              Save
            </Button>
          </div>
        )}
      </header>

      <ReactFlowProvider>
        <div className="wf-canvas-pane">
          <FlowCanvas workflow={normalizedData} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
