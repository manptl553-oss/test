import { BanIcon, PlusIcon } from "lucide-react";
import { useFlowStore } from "@/store";
import { CategoryTypes, NodeTypeProps } from "@/shared";
import { useEffect, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iconUrl = isCategory
    ? categoryMeta.get(nodeType as CategoryTypes)?.icon
    : nodeTypeMeta.get(nodeType as NodeTypeProps)?.icon;

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [iconUrl, nodeType]);

  if (!iconUrl) {
    return <PlusIcon width={size} height={size} className={className} />;
  }
  if(hasError)
  {
    return <BanIcon width={size} height={size} className={className}/>
  }
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {isLoading && (
        <div
          className={`animate-pulse bg-gray-200 rounded-full ${className}`}
          style={{ width: size, height: size }}
        />
      )}

      <img
        src={iconUrl}
        alt={nodeType}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } wf-image-container-size transition-opacity duration-300`}
        draggable={false}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};

export default WorkflowIcon;
