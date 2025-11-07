// WorkflowBuilder.tsx
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import { useFlowStore } from "@/core/store/useWorkflowStore";
import { useWorkflowContext } from "@/public";
import { Workflow } from "@/core/types/workflow.types";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Input } from "@/ui";

export function WorkflowBuilder({
  workflow,
  handleBack,
  handleUpdateWorkflowMeta,
  handleSaveWorkflow,
  handleRunWorkflow,
}: {
  handleBack: () => void;
  handleUpdateWorkflowMeta: () => void;
  handleRunWorkflow: () => void;
  handleSaveWorkflow: (workflow: Workflow) => void;
  workflow?: Workflow;
}) {
  const { theme } = useWorkflowContext();
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const normalizedData = useMemo(
    () => (workflow ? normalizeWorkflowData(workflow) : null),
    [workflow]
  );
  const isNameChanged = useMemo(
    () => workflow && workflowName.trim() !== workflow.name.trim(),
    [workflowName, workflow]
  );
  const nodes = useFlowStore((state) => state.nodes);

  return (
    <div className="flex-1 flex flex-col animate-fade-in bg-[var(--wf-background-base)] text-[var(--wf-text-default)]">
      <header className="border-b border-[var(--wf-border-default)] bg-[var(--wf-background-subtle)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="Back"
            className="    w-10 h-10 shrink-0 flex items-center justify-center
    bg-[var(--wf-brand-primary)] hover:brightness-110
    text-[var(--wf-text-inverted)]
    rounded-full
    shadow-md border border-[var(--wf-border-strong)]
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[var(--wf-border-focus)]
    focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--wf-background-base)]
"
          >
            <ArrowLeft color="black" size={20} />
          </button>

          <div className="flex gap-2 items-center">
            <Input
              id="workflow-name"
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name"
              className="max-w-sm shadow-input
                     border border-[var(--wf-border-default)]
                     bg-[var(--wf-background-base)] text-[var(--wf-text-default)]

                     focus-visible:ring-2 focus-visible:ring-[var(--wf-border-focus)]
                     focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--wf-background-base)]"
            />

            {isNameChanged && (
              <Button
                className="bg-[var(--wf-brand-primary)] hover:bg-[var(--wf-brand-secondary)] text-[var(--wf-text-inverted)] "
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
              className="bg-[var(--wf-brand-primary)] hover:bg-[var(--wf-brand-secondary)] text-[var(--wf-text-inverted)] "
              onClick={() =>
                normalizedData && handleSaveWorkflow(normalizedData)
              }
            >
              Save
            </Button>
          </div>
        )}
      </header>

      <ReactFlowProvider>
        <div className="relative w-full h-[calc(100vh_-_90px)] overflow-hidden bg-[var(--wf-background-base)]">
          <FlowCanvas workflow={workflow} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
