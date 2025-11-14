import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, Input } from "@/shared";
import { useFlowStore } from "@/store/workflow-store";
import { Workflow } from "@/shared/types/workflow.types";

export function WorkflowCanvas({
  workflow,
  handleBack,
  handleUpdateWorkflowMeta,
  handleSaveWorkflow,
}: {
  handleBack: () => void;
  handleUpdateWorkflowMeta: () => void;
  handleRunWorkflow: () => void;
  handleSaveWorkflow: (workflow: Workflow) => void;
  workflow?: Workflow;
}) {
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
    <div className="flex-1 flex flex-col animate-fade-in bg-(--wf-background-base) text-(--wf-text-default)">
      <header className="border-b border-(--wf-border-default) bg-(--wf-background-subtle) px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            aria-label="Back"
            className="    w-10 h-10 shrink-0 flex items-center justify-center
    bg-(--wf-brand-primary) hover:brightness-110
    text-(--wf-text-inverted)
    rounded-full
    shadow-md border border-(--wf-border-strong)
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-(--wf-border-focus)
    focus-visible:ring-offset-2 focus-visible:ring-offset-(--wf-background-base)
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
                     border border-(--wf-border-default)
                     bg-(--wf-background-base) text-(--wf-text-default)

                     focus-visible:ring-2 focus-visible:ring-(--wf-border-focus)
                     focus-visible:ring-offset-2 focus-visible:ring-offset-(--wf-background-base)"
            />

            {isNameChanged && (
              <Button
                className="bg-(--wf-brand-primary) hover:bg-(--wf-brand-secondary) text-(--wf-text-inverted) "
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
              className="bg-(--wf-brand-primary) hover:bg-(--wf-brand-secondary) text-(--wf-text-inverted) "
              onClick={() => {
                console.log(normalizedData);
                if (normalizedData) handleSaveWorkflow(normalizedData);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </header>

      <ReactFlowProvider>
        <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden bg-(--wf-background-base)">
          <FlowCanvas workflow={workflow} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
