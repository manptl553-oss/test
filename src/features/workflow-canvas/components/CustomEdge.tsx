import { NodeTypeProps, nodeTypeStyles } from "@/shared";
import { memo, useState, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "reactflow";
import { Settings } from "lucide-react";
import { useFlowStore } from "@/store";
import EdgeSettingsMenu from "./EdgeAettingsMenu";

const DOT_SPACING = 18; // distance between dots
const DOT_RADIUS = 4; // size of dots

function lerpColor(color1: string, color2: string, t: number) {
  const c1 = parseInt(color1?.slice(1), 16);
  const c2 = parseInt(color2?.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `rgb(${r},${g},${b})`;
}

export default memo(function CustomEdge(props: EdgeProps) {
  const { getNode } = useReactFlow();
  const { setEdgeForSidebar } = useFlowStore();
  const [showMenu, setShowMenu] = useState(false);

  const sourceNode = getNode(props.source);
  const targetNode = getNode(props.target);
  const sourceColor =
    nodeTypeStyles[sourceNode?.data?.type as NodeTypeProps]?.bg;
  const targetColor =
    nodeTypeStyles[targetNode?.data?.type as NodeTypeProps]?.bg;

  const {
    id,
    source,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
  } = props;

  // 1️⃣ Use a smooth curve path
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 30,
  });

  // 2️⃣ Compute direction + spacing manually
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const dotCount = Math.floor(length / DOT_SPACING);

  // 3️⃣ Calculate midpoint for menu
  const midX = sourceX + dx * 0.5;
  const midY = sourceY + dy * 0.5;

  // 4️⃣ Generate dots
  const dots = useMemo(() => {
    const result = [];
    for (let i = 1; i < dotCount; i++) {
      const t = i / dotCount;
      const color = lerpColor(sourceColor, targetColor, t);
      const x = sourceX + dx * t;
      const y = sourceY + dy * t;

      result.push(
        <circle
          key={i}
          cx={x}
          cy={y}
          r={DOT_RADIUS}
          fill={color}
          style={{
            filter: selected
              ? "drop-shadow(0 0 3px rgba(126, 192, 64, 0.8))"
              : "none",
          }}
        />
      );
    }
    return result;
  }, [dotCount, sourceX, sourceY, dx, dy, sourceColor, targetColor, selected]);

  // 5️⃣ Edge Menu Renderer
  const renderEdgeMenu = (x: number, y: number) => (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(${x}px, ${y}px) translateX(-50%)`,
          pointerEvents: "all",
        }}
        className="nodrag nopan flex flex-col items-center"
      >
        <button
          className="flex items-center justify-center w-5 h-5 rounded-full bg-primary hover:opacity-80 shadow-lg transition-all duration-200"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <Settings className="w-3 h-3 text-white" />
        </button>

        {showMenu && (
          <div className="mt-2">
            <EdgeSettingsMenu edge={props} onClose={() => setShowMenu(false)} />
          </div>
        )}
      </div>
    </EdgeLabelRenderer>
  );

  return (
    <>
      <g>
        {/* Invisible path for hit detection */}
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: "transparent",
            strokeWidth: 25,
            pointerEvents: "stroke",
          }}
        />

        {/* Render each dot */}
        {dots}
      </g>

      {/* Edge Menu */}
      {renderEdgeMenu(midX, midY)}
    </>
  );
});
