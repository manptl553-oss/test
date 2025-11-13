import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useFlowStore } from "@/store";
import { nodeCategoryConst, nodeTypeIcons, NodeTypeProps } from "@/shared";
import { NavigationItem } from "../types";

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
      const base = [{ type: "root", data: nodeCategory }];
      return isStartNode
        ? [...base, { type: "category", data: nodeCategory[0] }]
        : base;
    }
  );

  const currentView = navigationStack[navigationStack.length - 1];
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
    const Icon = nodeTypeIcons[nodeType];
    const nodeData = {
      name: template.name,
      type: nodeType,
      icon: Icon,
      description: template.description,
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
    return root.map((category) => (
      <div
        key={category.id}
        className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700 text-sm"
        onClick={() => navigateToCategory(category)}
      >
        <span className="w-3 h-3 bg-gray-400 rounded-full" />
        {category.name}
      </div>
    ));
  };

  const renderCategoryView = () => {
    const category = currentView.data;
    if (!category) return;
    const categoryArray = [];
    if (category?.nodeTemplates.length > 0) {
      categoryArray.push(
        ...category.nodeTemplates?.map((template: any) => (
          <div
            key={template.id}
            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700 text-sm"
            onClick={() => selectTemplate(template)}
          >
            <span className="w-3 h-3 bg-gray-400 rounded-full" />
            {template.name}
          </div>
        ))
      );
    }
    if (category?.subCategories?.length > 0) {
      categoryArray.push(
        ...category.subCategories.map((subCat: any) => (
          <div
            key={subCat.id}
            className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700 text-sm"
            onClick={() =>
              subCat?.subCategories?.length > 0
                ? navigateToCategory(subCat)
                : navigateToSubCategory(subCat)
            }
          >
            <span className="w-3 h-3 bg-gray-400 rounded-full" />
            {subCat.name}
          </div>
        ))
      );
    }
    return categoryArray;
  };

  const renderSubCategoryView = () => {
    const subCategory = currentView.data;
    return subCategory.nodeTemplates?.map((template: any) => (
      <div
        key={template.id}
        className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700 text-sm"
        onClick={() => selectTemplate(template)}
      >
        <span className="w-3 h-3 bg-gray-400 rounded-full" />
        {template.name}
      </div>
    ));
  };

  return (
    <div ref={panelRef} className="flex flex-col h-full">
      <div className="px-4 py-3 font-semibold text-gray-700 border-b flex items-center gap-2">
        {navigationStack.length > 1 && !isStartNode && (
          <button onClick={goBack} className="hover:bg-gray-100 p-1 rounded">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        Select Trigger
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {currentView.type === "root" && renderRootView()}
        {currentView.type === "category" && renderCategoryView()}
        {currentView.type === "subcategory" && renderSubCategoryView()}
      </div>
    </div>
  );
}
