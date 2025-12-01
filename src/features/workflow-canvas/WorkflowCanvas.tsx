import {
  Button,
  formatName,
  Input,
  nodeFieldsConfig,
  Option,
  Select,
  WorkFlowStatus,
} from "@/shared";
import {
  GroupIds,
  NodeExecutionEvent,
  SaveWorkFlowPayload,
  VersionData,
  Workflow,
} from "@/shared/types/workflow.types";
import { useFlowStore } from "@/store/workflow-store";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import FlowCanvas from "./components/FlowCanvas";
import { normalizeWorkflowData } from "./helpers/normalize";
import { FieldConfig, WorkflowCategoryList } from "./types";
import "./workflow-canvas.css";
export function WorkflowCanvas({
  nodeExecution,
  workflow,
  versions,
  handleVersionChange,
  nodeCategory,
  handleBack,
  handleSaveWorkflow,
  handleRunWorkflow,
  handlePublish,
  groupIds,
}: {
  nodeExecution: NodeExecutionEvent;
  workflow: Workflow;
  versions: VersionData[];
  handleVersionChange: (versionId: string) => void;
  nodeCategory: WorkflowCategoryList;
  handleBack: () => void;
  handleUpdateWorkflowMeta: () => void;
  handleRunWorkflow: (_: { workflowId: string; versionId: string }) => void;
  handleSaveWorkflow: (workflow: SaveWorkFlowPayload) => Promise<boolean>;
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
    buildTemplateRegistry,
    setNodeExecutionState,
  } = useFlowStore();

  const [workflowName, setWorkflowName] = useState(workflow?.name || "");
  const [selectedVersion, setSelectedVersion] = useState(
    workflow?.version?.version?.toString() || ""
  );
  const normalizedData = useMemo(
    () => (workflow ? normalizeWorkflowData(workflow) : null),
    [workflow]
  );
  // const isNameChanged = useMemo(
  //   () => workflow && workflowName.trim() !== workflow.name.trim(),
  //   [workflowName, workflow]
  // );

  useEffect(() => {
    if (!currentVersion || currentVersion.id != workflow.version.id)
      setCurrentVersion(workflow.version);
    if (nodeCategories.length === 0) setNodeCategories(nodeCategory);
    buildTemplateRegistry(nodeCategory);
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
  const groupIdsSelectOptions: Option[] = groupIds?.map((e) => ({
    label: e.name,
    value: e.id,
  }));
  nodeFieldsConfig["membership_invite"] = nodeFieldsConfig?.[
    "membership_invite"
  ]?.map((e) =>
    e.name == "groupIds"
      ? ({ ...e, options: groupIdsSelectOptions } as FieldConfig)
      : e
  );
  useEffect(() => {
    setNodeExecutionState(nodeExecution);
  }, [nodeExecution]);

  return (
    <div className="wf-canvas">
      <header className="wf-canvas__header">
        <div className="wf-header-left">
          <button
            onClick={handleBack}
            aria-label="Back"
            className="wf-back-button"
          >
            <ArrowLeft color="white" size={20} />
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
                className="wf-save-btn"
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
              className="wf-save-btn"
              onClick={async () => {
                const changes = getChangesForSync();
                if (changes) {
                  const payload = {
                    versionId: workflow?.version?.id,
                    name: workflowName,
                    description: workflow.description,
                    slug: workflow?.slug,
                  };
                  const isSaved = await handleSaveWorkflow({
                    ...payload,
                    ...changes,
                  });
                  if (isSaved) markAsSynced();
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
              {isDirty() ? "Save" : "Publish"}
            </Button>
          </div>
        )}
        {nodes?.length > 0 && (
          <div>
            <Button
              className="bg-(--wf-brand-primary) text-(--wf-text-inverted) "
              onClick={() => {
                handleRunWorkflow({
                  workflowId: workflow?.id,
                  versionId: workflow?.version?.id,
                });
              }}
            >
              Dry Run
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
