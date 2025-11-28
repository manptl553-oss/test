import {
  Button,
  formatName,
  groupIdsConst,
  Input,
  nodeFieldsConfig,
  Option,
  Select,
  WorkFlowStatus,
} from "@/shared";
import { GroupIds, VersionData, Workflow } from "@/shared/types/workflow.types";
import { useFlowStore } from "@/store/workflow-store";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import { FieldConfig, WorkflowCategoryList } from "./types";
export function WorkflowCanvas({
  workflow,
  versions,
  handleVersionChange,
  nodeCategory,
  handleBack,
  handleUpdateWorkflowMeta,
  handleSaveWorkflow,
  handlePublish,
  groupIds,
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
  groupIds: GroupIds[];
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
    isDirty,
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
        .find((t) => t?.type === "void_node");
      setVoidNode({
        name: voidNode?.name ?? "Void Node",
        type: voidNode?.type ?? "void_node",
        templateId: voidNode?.id ?? "",
      });
    }
  }, [currentVersion, nodeCategories, workflow.version]);

  //will remove groupIdsConst
  const groupIdsSelectOptions: Option[] =
    groupIds?.map((e) => ({
      label: e.name,
      value: e.id,
    })) ?? groupIdsConst;
  nodeFieldsConfig["membership_invite"] = nodeFieldsConfig?.[
    "membership_invite"
  ]?.map((e) =>
    e.name == "groupIds"
      ? ({ ...e, options: groupIdsSelectOptions } as FieldConfig)
      : e
  );

  return (
    <div className="flex-1 flex flex-col animate-fade-in bg-(--wf-background-base) text-(--wf-text-default)">
      <header className="border-y border-(--wf-border-default) bg-(--wf-background-subtle) px-6 py-3 flex items-center justify-between">
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
            <ArrowLeft color="white" size={20} />
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
              options={
                versions?.map((version) => ({
                  value: version.version.toString(),
                  label: formatName(version.name),
                })) || []
              }
              value={selectedVersion}
              onValueChange={(value: string) => {
                setSelectedVersion(value);
                handleVersionChange?.(value);
              }}
              placeholder="Select"
              className="w-[180px]"
            />

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
              className="bg-(--wf-brand-primary) text-(--wf-text-inverted) "
              onClick={() => {
                const changes = getChangesForSync();
                if (changes) {
                  const payload = {
                    versionId: workflow?.version?.id,
                    name: workflowName,
                    description: workflow.description,
                    slug: workflow?.slug,
                  };
                  handleSaveWorkflow({
                    ...payload,
                    ...changes,
                  });
                  markAsSynced();
                } else if (
                  workflow?.version?.status !== WorkFlowStatus.PUBLISHED
                ) {
                  handlePublish(
                    workflow?.version?.id,
                    WorkFlowStatus.PUBLISHED
                  );
                }
              }}
            >
              {!isDirty() &&
              workflow?.version?.status !== WorkFlowStatus.PUBLISHED
                ? "Publish"
                : "Save"}
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
