import { NODE_DEFINITIONS, nodeCategoryConst, NodeTypeProps, nodeTypeStyles } from "@/shared";
import { useFlowStore } from "@/store";
import { BugIcon, ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavigationItem } from "../types";
import { PopoverItem } from "./PopoverItem";

export default function NodePickerPanel({
  id,
  isStartNode = false,
}: {
  id: string;
  isStartNode?: boolean;
}) {
  const { updateNode, setActiveNode } = useFlowStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const nodeCategory = useMemo(
    () =>
      isStartNode
        ? nodeCategoryConst.filter((n) => n.name === "trigger") ?? []
        : nodeCategoryConst,
    [isStartNode]
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
  const style = nodeTypeStyles[currentView?.data?.type as NodeTypeProps] ||
    nodeTypeStyles[currentView?.data?.name as NodeTypeProps] || {
      icon: BugIcon,
      bg: "#d1d5db",
      border: "#6b7280",
    };

  const goBack = () => setNavigationStack((stack) => stack.slice(0, -1));
  const navigateToCategory = (category: any) =>
    setNavigationStack((stack) => [
      ...stack,
      { type: "category", data: category },
    ]);
  const navigateToSubCategory = (subCategory: any) =>
    setNavigationStack((stack) => [
      ...stack,
      { type: "subcategory", data: subCategory },
    ]);

  const selectTemplate = (template: any) => {
    const nodeType = template.type as NodeTypeProps;
    const Icon = nodeTypeStyles[nodeType]?.icon;
    const outputs=NODE_DEFINITIONS[nodeType] || ["none"]
    const nodeData = {
      name: template.name,
      templateId: template?.id,
      type: nodeType,
      icon: Icon,
      description: template.description,
      outputs
    };
    updateNode(id, nodeData);
    setActiveNode(null);
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
    return root.map((category: any) => {
      return (
        <PopoverItem
          key={category.id}
          category={category}
          onClick={() => navigateToCategory(category)}
        />
      );
    });
  };

  const renderCategoryView = () => {
    const category = currentView.data;
    if (!category) return;
    const categoryArray = [];
    if (category?.nodeTemplates?.length > 0) {
      const tempData = category.nodeTemplates?.map((template: any) => {
        return (
          <PopoverItem
            key={template.id}
            category={template}
            onClick={() => selectTemplate(template)}
          />
        );
      });
      categoryArray.push(...tempData);
    }
    if (category?.subCategories?.length > 0) {
      const tempData = category.subCategories.map((subCat: any) => {
        return (
          <PopoverItem
            key={subCat.id}
            category={subCat}
            onClick={() =>
              subCat?.subCategories?.length > 0
                ? navigateToCategory(subCat)
                : navigateToSubCategory(subCat)
            }
          />
        );
      });
      categoryArray.push(...tempData);
    }
    return categoryArray;
  };

  const renderSubCategoryView = () => {
    const subCategory = currentView.data;
    return subCategory.nodeTemplates?.map((template: any) => {
      return (
        <PopoverItem
          key={template.id}
          category={template}
          onClick={() => selectTemplate(template)}
        />
      );
    });
  };

  return (
    <div ref={panelRef} className="wf-node-picker">
      <div className="wf-node-picker__header">
        {navigationStack?.length > 1 && !isStartNode && (
          <button onClick={goBack} className="wf-node-picker__back">
            <ChevronLeft className="wf-icon-md" />
          </button>
        )}
        {currentView?.data?.name || "Start"}
      </div>
      {currentView.type !== "root" && (
        <div className="wf-node-picker__body">
          <div
            className="wf-node-picker__summary"
            style={{
              background: `${style.bg}20 `,
              border: `1px solid ${style.border}`,
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

      <div className="wf-node-picker__list">
        {currentView.type === "root" && renderRootView()}
        {currentView.type === "category" && renderCategoryView()}
        {currentView.type === "subcategory" && renderSubCategoryView()}
      </div>
    </div>
  );
}
