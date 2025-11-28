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
    },
    {
      icon: Unlink,
      label: "Unlink Nodes",
      onClick: handleUnlinkNodes,
    },
  ];

  return (
    <div className="wf-edge-menu" ref={menuRef}>
      <div className="wf-edge-menu__list">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="wf-edge-menu__item"
          >
            <item.icon className="wf-edge-menu__icon" />
            <span className="wf-edge-menu__label">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EdgeSettingsMenu;
