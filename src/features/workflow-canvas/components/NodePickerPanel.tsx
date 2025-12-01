import { NODE_DEFINITIONS, NodeTypeProps, nodeTypeStyles } from "@/shared";
import { useFlowStore } from "@/store";
import { BugIcon, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavigationItem, NodeTemplate, WorkflowCategory } from "../types";
import { PopoverItem } from "./PopoverItem";

export default function NodePickerPanel({
  id,
  isStartNode = false,
}: {
  id: string;
  isStartNode?: boolean;
}) {
  const { updateNode, setActiveNode, nodeCategories } = useFlowStore();
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
  const style = nodeTypeStyles[
    (currentView?.data as WorkflowCategory)?.name as NodeTypeProps
  ] || {
    icon: BugIcon,
    bg: "bg-gray-300",
    border: "border-gray-500",
  };
  // nodeTypeStyles[(currentView?.data as WorkflowCategory)?.type as NodeTypeProps] ||

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
    const Icon = nodeTypeStyles[nodeType]?.icon;
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
    <div ref={panelRef} className="wf-node-picker">
      <div className="wf-node-picker__header">
        {navigationStack?.length > 1 && !isStartNode && (
          <button onClick={goBack} className="wf-node-picker__back">
            <ChevronLeft className="wf-icon-md" />
          </button>
        )}
        {(currentView?.data as WorkflowCategory)?.name || "Start"}
      </div>

      {/* Category Header Preview */}
      {currentView.type !== "root" && (
        <div className="wf-node-picker__body">
          <div
            className="wf-node-picker__summary"
            style={{
              background: `${style.bg}20`, // keep dynamic branding tint
              borderColor: style.border,
            }}
          >
            <div
              className="wf-node-picker__summary-icon"
              style={{
                background: style.bg,
              }}
            >
              <style.icon />
            </div>

            <span className="wf-node-picker__summary-title">
              {currentView?.data?.name || "Start"}
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
