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
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteEdge, addNodeBetweenEdge } = useFlowStore();

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
      data: { id, type: "addNode" },
    };

    // addNodeBetweenEdge(newNode, edge);
    onClose();
  };

  const handleUnlinkNodes = () => {
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

    // capture phase
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside, true);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="bg-white p-2 rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200 min-w-[120px] border border-gray-200"
    >
      {/* Add Node Between */}
      <button
        onClick={handleAddNodeBetween}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 rounded-md",
          "hover:bg-blue-500 hover:text-white transition-colors text-gray-700"
        )}
      >
        <Plus className="w-3 h-3" />
        <span className="text-xs">Add Node</span>
      </button>

      {/* Unlink */}
      <button
        onClick={handleUnlinkNodes}
        className={cn(
          "flex w-full items-center gap-2 px-2 py-1.5 rounded-md mt-1",
          "hover:bg-red-500 hover:text-white transition-colors text-gray-700"
        )}
      >
        <Unlink className="w-3 h-3" />
        <span className="text-xs">Unlink</span>
      </button>
    </div>
  );
};

export default EdgeSettingsMenu;
