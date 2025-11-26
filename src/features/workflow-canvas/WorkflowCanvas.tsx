import {
  Button,
  FieldOption,
  formatName,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  WorkFlowStatus,
} from "@/shared";
import { VersionData, Workflow } from "@/shared/types/workflow.types";
import { useFlowStore } from "@/store/workflow-store";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import { WorkflowCategoryList } from "./types";
export function WorkflowCanvas({
  workflow,
  versions,
  handleVersionChange,
  nodeCategory,
  handleBack,
  handleUpdateWorkflowMeta,
  handleSaveWorkflow,
  handlePublish,
}: {
  workflow: Workflow;
  versions: VersionData[];
  handleVersionChange: (versionId: string) => void;
  nodeCategory: WorkflowCategoryList;
  handleBack: () => void;
  handleUpdateWorkflowMeta: () => void;
  handleRunWorkflow: () => void;
  handleSaveWorkflow: (workflow: any) => void;
  handlePublish: (versionId: string, status: WorkFlowStatus) => void;
}) {
  const {
    getChangesForSync,
    nodes,
    setCurrentVersion,
    currentVersion,
    setNodeCategories,
    nodeCategories,
    voidNode,
    setVoidNode,
    markAsSynced,
  } = useFlowStore();
  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const [selectedVersion, setSelectedVersion] = useState(
    workflow?.version?.version?.toString() || ""
  );
  const normalizedData = useMemo(
    () => (workflow ? normalizeWorkflowData(workflow) : null),
    [workflow]
  );
  const isNameChanged = useMemo(
    () => workflow && workflowName.trim() !== workflow.name.trim(),
    [workflowName, workflow]
  );

  useEffect(() => {
    if (!currentVersion || currentVersion.id != workflow.version.id)
      setCurrentVersion(workflow.version);
    if (nodeCategories.length === 0) setNodeCategories(nodeCategory);

    if (!voidNode) {
      const voidNode = nodeCategory
        .flatMap((cat) => cat.nodeTemplates)
        .find((t) => t.type === "void_node");
      setVoidNode({
        name: voidNode?.name ?? "Void Node",
        type: voidNode?.type ?? "void_node",
        templateId: voidNode?.id ?? "",
      });
    }
  }, [currentVersion, nodeCategories, workflow.version]);

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
    focus-visible:outline-none focus-visible:ring-0
    focus-visible:ring-(--wf-border-focus)
    focus-visible:ring-offset-0 focus-visible:ring-offset-(--wf-background-base)
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

                     focus-visible:ring-0 focus-visible:ring-(--wf-border-focus)
                     focus-visible:ring-offset-0 focus-visible:ring-offset-(--wf-background-base)"
            />

            <Select
              value={selectedVersion}
              onValueChange={(value) => {
                setSelectedVersion(value);
                handleVersionChange?.(value);
              }}
            >
              <SelectTrigger className="w-[180px] border border-(--wf-border-default) bg-(--wf-background-base) text-(--wf-text-default)">
                <SelectValue placeholder="Select">
                  {formatName(workflow.version.name)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-(--wf-background-base) border border-(--wf-border-default) text-white">
                {versions?.map((version) => (
                  <SelectItem
                    key={version.id}
                    value={version.version.toString()}
                  >
                    {formatName(version.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {workflow.version.status == WorkFlowStatus.PUBLISHED ? (
              <p>published</p>
            ) : (
              <Button
                className="bg-(--wf-brand-primary) hover:bg-(--wf-brand-secondary) text-(--wf-text-inverted) "
                onClick={() => {
                  handlePublish(
                    workflow?.version?.id,
                    WorkFlowStatus.PUBLISHED
                  );
                }}
              >
                Publish
              </Button>
            )}
            {/* {isNameChanged && (
              <Button
                className="bg-(--wf-brand-primary) hover:bg-(--wf-brand-secondary) text-(--wf-text-inverted) "
                onClick={handleUpdateWorkflowMeta}
              >
                Save
              </Button>
            )} */}
          </div>
        </div>
        {nodes?.length > 0 && (
          <div>
            <Button
              className="bg-(--wf-brand-primary) hover:bg-(--wf-brand-secondary) text-(--wf-text-inverted) "
              onClick={() => {
                const changes = getChangesForSync();
                if (changes)
                  handleSaveWorkflow({
                    ...workflow,
                    versionId: workflow?.version?.id,
                    ...changes,
                  });
                markAsSynced();
              }}
            >
              Save
            </Button>
          </div>
        )}
      </header>

      <ReactFlowProvider>
        <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden bg-(--wf-background-base)">
          <FlowCanvas workflow={normalizedData} />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
