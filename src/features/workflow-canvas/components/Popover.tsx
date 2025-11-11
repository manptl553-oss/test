import { X, Search, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const PopoverPanel = ({
  anchor,
  viewport,
  config,
  onClose,
}: {
  anchor: { nodeId: string; position: { x: number; y: number } };
  viewport: { x: number; y: number; zoom: number };
  config: any;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    side: "right" as "left" | "right",
    arrowTop: 0,
  });

  const POPOVER_WIDTH = 380;
  const NODE_DIAMETER = 128;
  const GAP = 20;
  const ARROW_SIZE = 12;

  // ✅ Smooth position updates using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      const { zoom, x: vx, y: vy } = viewport;
      const { x, y } = anchor.position;

      // Node center in screen coordinates
      const nodeCenterX = x * zoom + vx + (NODE_DIAMETER * zoom) / 2;
      const nodeCenterY = y * zoom + vy + (NODE_DIAMETER * zoom) / 2;
      
      const nodeRadius = (NODE_DIAMETER * zoom) / 2;

      const popoverHeight = ref.current?.offsetHeight || 420;

      // Calculate positions for both sides
      const rightX = nodeCenterX + nodeRadius + GAP;
      const leftX = nodeCenterX - nodeRadius - GAP - POPOVER_WIDTH;

      // Determine which side has more space
      const spaceOnRight = window.innerWidth - rightX;
      const spaceOnLeft = leftX;

      let side: "left" | "right" = "right";
      let left = rightX;

      // Choose side with more space
      if (spaceOnRight < POPOVER_WIDTH + 20 && spaceOnLeft > POPOVER_WIDTH) {
        left = leftX;
        side = "left";
      }

      // Vertically center the popover on the node
      let top = nodeCenterY - popoverHeight / 2;

      // Clamp vertically with padding
      const minTop = 20;
      const maxTop = window.innerHeight - popoverHeight - 20;
      top = Math.max(minTop, Math.min(top, maxTop));

      // Calculate arrow position (should point to node center)
      const arrowTop = nodeCenterY - top;

      setPos({ top, left, side, arrowTop });

      // Continue updating on next frame
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [anchor.position, anchor.nodeId, viewport]);

  // ✅ Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Small delay to prevent immediate close on open
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-2xl shadow-2xl p-4 w-[380px] pointer-events-auto"
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transition: "none", // No CSS transition - we use RAF for smooth updates
      }}
    >
      {/* Arrow pointing to node */}
      {pos.side === "right" ? (
        <div
          className="absolute w-0 h-0 
            border-t-[12px] border-b-[12px] border-r-[12px] 
            border-t-transparent border-b-transparent border-r-white 
            drop-shadow-lg"
          style={{
            left: "-12px",
            top: `${pos.arrowTop}px`,
            transform: "translateY(-50%)",
          }}
        />
      ) : (
        <div
          className="absolute w-0 h-0 
            border-t-[12px] border-b-[12px] border-l-[12px] 
            border-t-transparent border-b-transparent border-l-white 
            drop-shadow-lg"
          style={{
            right: "-12px",
            top: `${pos.arrowTop}px`,
            transform: "translateY(-50%)",
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {config.title}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Trigger block */}
      <div className="mb-4 p-4 bg-green-50 rounded-lg flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mb-2 shadow-sm">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-700">Trigger</span>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules"
            className="w-full pl-10 pr-4 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col space-y-1 overflow-y-auto max-h-[340px] pr-1">
        {config.items.map((item: any) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-150"
              onClick={() => {
                config.onSelect?.(item);
                onClose();
              }}
            >
              <div className={`p-2 rounded-full ${item.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};