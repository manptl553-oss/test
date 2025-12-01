import { PlusIcon } from "lucide-react";
import { useFlowStore } from "@/store";
import { CategoryTypes, NodeTypeProps } from "@/shared";

interface WorkflowIconProps {
  nodeType: NodeTypeProps | CategoryTypes;
  size?: number;
  className?: string;
  isCategory?: boolean;
}

const WorkflowIcon = ({
  nodeType,
  size = 40,
  className = "",
  isCategory = false,
}: WorkflowIconProps) => {
  const { nodeTypeMeta, categoryMeta } = useFlowStore();
  const iconUrl = isCategory
    ? categoryMeta.get(nodeType as CategoryTypes)?.icon
    : nodeTypeMeta.get(nodeType as NodeTypeProps)?.icon;

  if (!iconUrl) {
    return <PlusIcon width={size} height={size} className={className} />;
  }

  return (
    <img
      src={iconUrl}
      alt={nodeType}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
};

export default WorkflowIcon;
