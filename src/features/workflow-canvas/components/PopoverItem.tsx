import { NodeIconTypeProps, NodeTypeProps, nodeTypeStyles } from "@/shared";
import { BugIcon } from "lucide-react";

interface CategoryItemProps {
  category: any;
  onClick?: () => void;
}

export function PopoverItem({ category, onClick }: CategoryItemProps) {
  const style = nodeTypeStyles[category?.type as NodeTypeProps] ||
    nodeTypeStyles[category?.name as NodeIconTypeProps] || {
      icon: BugIcon,
      bg: "#e5e7eb", // gray-200
      border: "#9ca3af", // gray-400
    };

  const Icon = style.icon;

  return (
    <div
      key={category.id}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="wf-popover-item"
    >
      <span
        className="wf-popover-item__icon"
        style={{ background: style?.bg }}
        aria-hidden
      >
        <Icon />
      </span>

      {/* Text (single- or two-line) */}
      <div className="wf-popover-item__text">
        <span
          className="wf-popover-item__title"
          title={category.name}
        >
          {category.name}
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
