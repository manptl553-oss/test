import { cn } from "@/shared";
import { useFlowStore } from "@/store";
import { Plus, Unlink } from "lucide-react";
import { useEffect, useRef } from "react";
import { EdgeProps } from "reactflow";
import { v4 as uuidv4 } from "uuid";

interface EdgeSettingsMenuProps {
  edge: EdgeProps;
  onClose: () => void;
}

const EdgeSettingsMenu = ({ edge, onClose }: EdgeSettingsMenuProps) => {
  const { deleteEdge, addNodeBetweenEdge } = useFlowStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const handleAddNodeBetween = () => {
    const position = {
      x: edge?.sourceX + 20,
      y: edge?.sourceY + 20,
    };
    const id = uuidv4();
    const newNode = {
      id,
      type: "custom",
      position,
      data: {
        id,
        type: "addNode",
      },
    };
    addNodeBetweenEdge(newNode, edge);
    onClose();
  };

  const handleUnlinkNodes = async () => {
    deleteEdge(edge.id);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    // Use capture phase to catch events before React Flow
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside, true);
  }, [onClose]);

  const menuItems = [
    {
      icon: Plus,
      label: "Add Node Between",
      onClick: handleAddNodeBetween,
      color: "text-success hover:bg-success/10",
    },
    {
      icon: Unlink,
      label: "Unlink Nodes",
      onClick: handleUnlinkNodes,
      color: "text-warning hover:bg-warning/10",
    },
  ];

  return (
    <div
      className="bg-white p-2  rounded-lg shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50"
      ref={menuRef}
    >
      <div className=" border !border-gray-200 ">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              "w-full px-2 py-2 flex items-center group  gap-1.5",
              "text-sm font-medium transition-colors",
              "hover:bg-accent/50",
              item.color,
              "border-b border-border !border-gray-200  hover:bg-blue-500 hover:text-white  last:border-b-0"
            )}
          >
            <item.icon className="w-2.5 h-2.5 text-gray-700  group-hover:text-white" />
            <span className="!text-[10px] text-gray-700 group-hover:text-white font-normal">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EdgeSettingsMenu;
