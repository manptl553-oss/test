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
    <div ref={panelRef} className="flex flex-col h-full ">
      <div className="px-0 pb-2 font-medium text-gray-700 border-b border-gray-300 flex items-center gap-2">
        {navigationStack?.length > 1 && !isStartNode && (
          <button onClick={goBack} className="hover:bg-gray-100 p-1 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {(currentView?.data as WorkflowCategory)?.name || "Start"}
      </div>
      {currentView.type !== "root" && (
        <div className="relative py-4 space-y-4">
          <div
            className={`flex flex-col space-y-2 items-center justify-center border-2 border-solid rounded-lg p-5 `}
            style={{
              background: `${style.bg}20 `,
              border: `1px solid ${style.border}`,
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center p-2 bg-white/15"
              style={{
                background: style.bg,
              }}
            >
              <style.icon className="text-white w-8 h-8" />
            </div>

            <span className="text-black text-sm font-medium">
              {currentView?.data?.name || "Start"}
            </span>
            {/* <div className="rounded-md relative pl-8 pr-3.5 py-2 bg-white border border-black/15">
              <input
                type="search"
                placeholder="Search Your Inputs"
                className="placeholder:text-gray-600 text-sm font-medium text-black"
              />
            </div> */}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-2 h-full max-h-80 space-y-1 ">
        {renderRootView()}
        {renderCategoryView()}
        {renderSubCategoryView()}
      </div>
    </div>
  );
}
