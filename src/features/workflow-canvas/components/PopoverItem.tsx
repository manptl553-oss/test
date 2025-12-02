import { CategoryTypes, formatName, NodeTypeProps } from "@/shared";
import { useFlowStore } from "@/store";
import WorkflowIcon from "./WorkflowIcon";
import { NodeTemplate, WorkflowNodesCategory } from "../types";

interface CategoryItemProps {
  category: WorkflowNodesCategory | NodeTemplate;
  onClick?: () => void;
}

export function PopoverItem({ category, onClick }: CategoryItemProps) {
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
  return (
    <div
      key={category.id}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="wf-popover-item"
    >
      {/* Icon bubble */}
      <span
        className="wf-popover-item__icon"
        style={{ background: style?.color }}
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
        <span className="wf-popover-item__title" title={category.name}>
          {formatName(category.name)}
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
