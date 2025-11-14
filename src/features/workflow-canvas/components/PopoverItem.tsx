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
      className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700 text-sm font-semibold"
      onClick={onClick}
    >
      {/* Icon bubble */}
      <span
        className={`w-8 shrink-0 h-8 p-2 rounded-full flex items-center justify-center `}
        style={{
          background: style.bg,
        }}
      >
        <Icon className="w-4 h-4 text-white" />
      </span>

      {/* Text */}
      <div className="relative space-y-1 max-w-[200px]">
        <span className="block text-sm text-gray-800 font-semibold">
          {category.name}
        </span>
        {/* 
        <span className="block text-sm text-black/60 font-normal line-clamp-2">
          {category.description || ""}
        </span> */}
      </div>
    </div>
  );
}
