import { CategoryTypes, formatName, NodeTypeProps } from "@/shared";
import { useFlowStore } from "@/store";
import WorkflowIcon from "./WorkflowIcon";

interface CategoryItemProps {
  category: any;
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
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer
                 hover:bg-(--wf-background-subtle) transition-colors"
    >
      {/* Icon bubble */}
      <span
        className="w-10 h-10 p-2 flex-none rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: style?.color }}
        aria-hidden
      >
        <WorkflowIcon
          nodeType={category.type ?? category.name}
          size={40}
          isCategory={!category.type}
        />
      </span>

      {/* Name + description */}
      <div className="flex flex-col justify-center w-full min-w-0">
        <span
          className="text-sm font-medium truncate text-(--wf-text-default)"
          title={category.name}
        >
          {formatName(category.name)}
        </span>

        {category?.type && (
          <span
            className="text-xs truncate text-(--wf-text-muted)"
            title={category.description || ""}
          >
            {category.description || ""}
          </span>
        )}
      </div>
    </div>
  );
}
