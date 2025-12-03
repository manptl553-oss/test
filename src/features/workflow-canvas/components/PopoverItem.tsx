<<<<<<< HEAD
import { NodeIconTypeProps, NodeTypeProps, nodeTypeStyles } from "@/shared";
import { BugIcon } from "lucide-react";
=======
import { CategoryTypes, formatName, NodeTypeProps } from "@/shared";
import { useFlowStore } from "@/store";
import WorkflowIcon from "./WorkflowIcon";
import { NodeTemplate, WorkflowNodesCategory } from "../types";
>>>>>>> b916dd2f9979662654d2b06d437009e211054025

interface CategoryItemProps {
  category: WorkflowNodesCategory | NodeTemplate;
  onClick?: () => void;
}

export function PopoverItem({ category, onClick }: CategoryItemProps) {
<<<<<<< HEAD
  const style = nodeTypeStyles[category?.type as NodeTypeProps] ||
    nodeTypeStyles[category?.name as NodeIconTypeProps] || {
      icon: BugIcon,
      bg: "#e5e7eb", // gray-200
      border: "#9ca3af", // gray-400
    };

  const Icon = style.icon;

=======
  const { nodeTypeMeta, categoryMeta } = useFlowStore();
  let style = {
    color: "#6B7280",
    border: "rgba(107, 114, 128, 0.35)",
  };
  const categoryType = (category as NodeTemplate)?.type as NodeTypeProps;
  if (categoryType) {
    const templateMeta = nodeTypeMeta.get(categoryType);
    style = templateMeta ?? style;
  } else if (category?.name) {
    const categoryMetaItem = categoryMeta.get(category.name as CategoryTypes);
    style = categoryMetaItem ?? style;
  }
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
  return (
    <div
      key={category.id}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="wf-popover-item"
    >
      <span
        className="wf-popover-item__icon"
<<<<<<< HEAD
        style={{ background: style?.bg }}
=======
        style={{ background: style?.color }}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
        aria-hidden
      >
        <WorkflowIcon
          nodeType={categoryType ?? category.name}
          size={20}
          isCategory={!categoryType}
        />
      </span>

      {/* Text (single- or two-line) */}
      <div className="wf-popover-item__text">
<<<<<<< HEAD
        <span
          className="wf-popover-item__title"
          title={category.name}
        >
          {category.name}
=======
        <span className="wf-popover-item__title" title={category.name}>
          {formatName(category.name)}
>>>>>>> b916dd2f9979662654d2b06d437009e211054025
        </span>

        {categoryType && (
          <span
            className="wf-popover-item__subtitle"
            title={category.description || ""}
          >
            {category.description || ""}
          </span>
        )}
      </div>
    </div>
  );
}
