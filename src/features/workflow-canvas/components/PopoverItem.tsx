import { CategoryTypes, formatName, NodeTypeProps } from "@/shared";
import { useFlowStore } from "@/store";
import WorkflowIcon from "./WorkflowIcon";


export interface BaseCategory {
  id: string | number;
  name: string;
  description?: string;
  type: NodeTypeProps | CategoryTypes;
}
interface CategoryItemProps {
  category: BaseCategory;
  onClick?: () => void;
}

export function PopoverItem({ category, onClick }: CategoryItemProps) {
  const { nodeTypeMeta, categoryMeta } = useFlowStore();
  let style = {
    color: "#6B7280",
    border: "rgba(107, 114, 128, 0.35)",
  };
  if (category?.type) {
    const templateMeta = nodeTypeMeta.get(category.type as NodeTypeProps);
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
          nodeType={category.type ?? category.name}
          size={40}
          isCategory={!category.type}
        />
      </span>

      {/* Text (single- or two-line) */}
      <div className="wf-popover-item__text">
        <span className="wf-popover-item__title" title={category.name}>
          {formatName(category.name)}
        </span>

        {category?.type && (
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
