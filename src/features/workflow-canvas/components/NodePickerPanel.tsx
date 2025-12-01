import {
  CategoryTypes,
  formatName,
  NODE_DEFINITIONS,
  NodeTypeProps,
} from "@/shared";
import { useFlowStore } from "@/store";
import { BugIcon, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavigationItem, NodeTemplate, WorkflowCategory } from "../types";
import { PopoverItem } from "./PopoverItem";
import WorkflowIcon from "./WorkflowIcon";

export default function NodePickerPanel({
  id,
  isStartNode = false,
}: {
  id: string;
  isStartNode?: boolean;
}) {
  const {
    updateNode,
    setActiveNode,
    nodeCategories,
    categoryMeta,
    nodeTypeMeta,
  } = useFlowStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const nodeCategory = useMemo(
    () =>
      isStartNode
        ? nodeCategories.filter((n) => n.name === "trigger") ?? []
        : nodeCategories,
    [isStartNode, nodeCategories]
  );
  const [navigationStack, setNavigationStack] = useState<NavigationItem[]>(
    () => {
      return isStartNode
        ? [
            { type: "root", data: nodeCategory },
            { type: "category", data: nodeCategory[0] },
          ]
        : [{ type: "root", data: nodeCategory }];
    }
  );

  const currentView = navigationStack[navigationStack.length - 1];
  const style = categoryMeta.get(
    (currentView?.data as WorkflowCategory)?.name as CategoryTypes
  ) || {
    icon: BugIcon,
    color: "bg-gray-300",
    border: "border-gray-500",
  };

  const goBack = () => setNavigationStack((stack) => stack.slice(0, -1));
  const navigateToCategory = (category: WorkflowCategory) =>
    setNavigationStack((stack) => [
      ...stack,
      { type: "category", data: category },
    ]);
  const navigateToSubCategory = (subCategory: WorkflowCategory) =>
    setNavigationStack((stack) => [
      ...stack,
      { type: "subcategory", data: subCategory },
    ]);

  const selectTemplate = (template: NodeTemplate) => {
    const nodeType = template.type as NodeTypeProps;
    const Icon = nodeTypeMeta.get(nodeType)?.icon;
    const outputs = NODE_DEFINITIONS[nodeType] || ["none"];
    const nodeData = {
      name: template.name,
      templateId: template?.id,
      type: nodeType,
      icon: Icon,
      description: template.description,
      outputs,
    };
    updateNode(id, nodeData);
    setNavigationStack([{ type: "root", data: nodeCategory }]);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActiveNode(null);
        setNavigationStack([{ type: "root", data: nodeCategory }]);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const renderRootView = () => {
    const root = currentView.type === "root" ? currentView.data : [];
    if (!root) return;
    return root.map(
      (category: WorkflowCategory) =>
        category.visibility && (
          <PopoverItem
            key={category.id}
            category={category}
            onClick={() => navigateToCategory(category)}
          />
        )
    );
  };

  const renderCategoryView = () => {
    const category =
      currentView.type === "category" ? currentView?.data : undefined;
    if (!category) return;
    const categoryArray = [];
    if (category?.nodeTemplates?.length > 0) {
      const tempData = category.nodeTemplates?.map(
        (template: NodeTemplate) =>
          template.visibility && (
            <PopoverItem
              key={template.id}
              category={template}
              onClick={() => selectTemplate(template)}
            />
          )
      );
      categoryArray.push(...tempData);
    }
    if (category?.subCategories?.length > 0) {
      const tempData = category.subCategories.map(
        (subCat: WorkflowCategory) =>
          subCat.visibility && (
            <PopoverItem
              key={subCat.id}
              category={subCat}
              onClick={() =>
                subCat?.subCategories?.length > 0
                  ? navigateToCategory(subCat)
                  : navigateToSubCategory(subCat)
              }
            />
          )
      );
      categoryArray.push(...tempData);
    }
    return categoryArray;
  };

  const renderSubCategoryView = () => {
    const subCategory =
      currentView?.type === "subcategory" ? currentView?.data : undefined;
    if (!subCategory) return;
    return subCategory.nodeTemplates?.map(
      (template: NodeTemplate) =>
        template.visibility && (
          <PopoverItem
            key={template.id}
            category={template}
            onClick={() => selectTemplate(template)}
          />
        )
    );
  };

  return (
    <div ref={panelRef} className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-0 pb-2 font-medium text-sm text-(--wf-text-default)
                    border-b border-(--wf-border-default) flex items-center gap-2"
      >
        {navigationStack?.length > 1 && !isStartNode && (
          <button
            onClick={goBack}
            className="hover:bg-(--wf-background-subtle) p-1 rounded"
          >
            <ChevronLeft className="w-5 h-5 text-(--wf-text-default)" />
          </button>
        )}
        {formatName((currentView?.data as WorkflowCategory)?.name || "Start")}
      </div>

      {/* Category Header Preview */}
      {currentView.type !== "root" && (
        <div className="relative py-4 space-y-4">
          <div
            className="flex flex-col space-y-2 items-center justify-center rounded-lg p-5
                     border border-(--wf-border-default)"
            style={{
              background: `${style.color}20`, // keep dynamic branding tint
              borderColor: style.border ?? style.color,
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center p-2"
              style={{ background: style.color }}
            >
              <WorkflowIcon
                nodeType={
                  ((currentView?.data as WorkflowCategory)
                    ?.name as CategoryTypes) || ""
                }
                isCategory={true}
                className="text-white w-8 h-8"
              />
            </div>

            <span className="text-(--wf-text-default) text-sm font-medium">
              {formatName(currentView?.data?.name || "Start")}
            </span>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-2 py-2 h-full max-h-80 space-y-1">
        {renderRootView()}
        {renderCategoryView()}
        {renderSubCategoryView()}
      </div>
    </div>
  );
}
