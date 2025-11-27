import {
  formatName,
  NodeIconTypeProps,
  NodeTypeProps,
  nodeTypeStyles,
} from "@/shared";
import { BugIcon } from "lucide-react";

interface CategoryItemProps {
  category: any;
  onClick?: () => void;
}

export function PopoverItem({ category, onClick }: CategoryItemProps) {
  const style =
    nodeTypeStyles[category?.type as NodeTypeProps] ||
    nodeTypeStyles[category?.name as NodeIconTypeProps] || {
      icon: BugIcon,
      bg: "#e5e7eb",
      border: "#9ca3af",
    };

  const Icon = style.icon;

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
        className="w-8 h-8 flex-none rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: style?.bg }}  // keep dynamic branding
        aria-hidden
      >
        <Icon className="w-4 h-4 text-white" />
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
