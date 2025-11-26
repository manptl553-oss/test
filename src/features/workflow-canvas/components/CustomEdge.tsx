import React, { memo, useMemo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  useStore,
} from "reactflow";
import {
  cn,
  formatName,
  getEdgeLabel,
  NodeTypeProps,
  nodeTypeStyles,
} from "@/shared";
import { useFlowStore } from "@/store";
import { Plus, Unlink } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/* -------------------------------------------------------------------
   CONSTANTS
------------------------------------------------------------------- */
const DOT_SPACING = 18;
const DOT_RADIUS = 4;

const NODE_MAIN_RADIUS = 52; // Visual circle size for your node
const EDGE_CAP_RADIUS = 10; // Half-circle size
const EDGE_CAP_GAP = -2; // Negative = slight overlap into main circle

/* -------------------------------------------------------------------
   UTIL — Color Interpolation
------------------------------------------------------------------- */
const lerpColor = (c1: string, c2: string, t: number) => {
  const a = parseInt(c1.slice(1), 16);
  const b = parseInt(c2.slice(1), 16);

  return `rgb(
    ${((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t},
    ${((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t},
    ${(a & 255) * (1 - t) + (b & 255) * t}
  )`;
};

/* -------------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------- */
const CustomEdge = memo((props: EdgeProps) => {
  const { id, source, target, sourceX, sourceY, targetX, targetY } = props;
  const [hovered, setHovered] = useState(false);
  const { getNode } = useReactFlow();
  const nodeInternals = useStore((s) => s.nodeInternals);

  const { deleteEdge, addNodeBetweenEdge } = useFlowStore();
  const sourceNode: any = getNode(source);
  const targetNode = getNode(target);
  const allNodes = useMemo(
    () => Array.from(nodeInternals.values()),
    [nodeInternals]
  );
  const label = getEdgeLabel(props?.sourceHandleId ?? undefined);
  const isSelf = source === target;

  const sourceColor =
    nodeTypeStyles[sourceNode?.data?.type as NodeTypeProps]?.bg ?? "#3b82f6";
  const targetColor =
    nodeTypeStyles[targetNode?.data?.type as NodeTypeProps]?.bg ?? "#10b981";

  //  SELF LOOP (clean U-shape)
  const isSelfLoop = props?.data?.loopType === "self";
  const isLoopChild = props?.data?.loopType === "loop-child"; // loop → child
  const isLoopBack = props?.data?.loopType === "loop-back"; // child → loop

  const handleAddNodeBetween = () => {
    const position = {
      x: (props?.sourceX + props?.targetX) / 2 - 20,
      y: (props?.sourceY + props?.targetY) / 2 - 20,
    };

    addNodeBetweenEdge(position, {
      ...props,
      sourceHandle: props.sourceHandleId,
      targetHandle: props.targetHandleId,
    });
  };

  const handleUnlinkNodes = () => {
    deleteEdge(props.id);
  };

  // 5️⃣ Edge Menu Renderer
  const renderEdgeActions = (x: number, y: number, angleDeg: number) => (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(${x}px, ${
            y + 12
          }px) translate(-50%, -50%) rotate(${angleDeg}deg)`,
          pointerEvents: "none",
        }}
        className="absolute nodrag nopan"
      >
        <div
          className={cn(
            "flex items-center gap-1 transition-opacity duration-200",
            hovered ? "opacity-100" : "opacity-0"
          )}
          style={{ pointerEvents: "all" }}
        >
          <button
            onClick={handleAddNodeBetween}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 shadow-md transition-all"
          >
            <Plus className="w-3 h-3 text-white" />
          </button>

          <button
            onClick={handleUnlinkNodes}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 shadow-md transition-all"
          >
            <Unlink className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </EdgeLabelRenderer>
  );

  const renderEdgeLabel = (
    x: number,
    y: number,
    angleDeg: number,
    text: string
  ) => (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(${x}px, ${
            y - 12
          }px) translate(-50%, -50%) rotate(${angleDeg}deg)`,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
        className="nodrag nopan"
      >
        <div className="text-xs px-2 py-1 text-black">{text}</div>
      </div>
    </EdgeLabelRenderer>
  );

  //  if (isSelfLoop) {
  //     const pos = sourceNode.positionAbsolute;
  //     const width = sourceNode.width;
  //     const height = sourceNode.height;

  //     const left = pos.x - 80;
  //     const right = pos.x + width + 80;
  //     const top = pos.y - 40;
  //     const bottom = pos.y + height + 40;

  //     const path = `
  //       M ${pos.x + width} ${pos.y + height / 2}
  //       L ${right} ${pos.y + height / 2}
  //       L ${right} ${bottom}
  //       L ${left} ${bottom}
  //       L ${left} ${pos.y + height / 2}
  //       L ${pos.x} ${pos.y + height / 2}
  //     `;

  //     return (
  //       <g
  //         onMouseEnter={() => setHovered(true)}
  //         onMouseLeave={() => setHovered(false)}
  //       >
  //         <path d={path} stroke={sourceColor} strokeWidth={3} fill="none" />
  //         {renderEdgeActions(pos.x + width / 2, bottom)}
  //       </g>
  //     );
  //   }

  /* =====================================================================================
     2) LOOP → CHILD  (simple smooth path)
  ===================================================================================== */
  // if (isLoopChild) {
  //   const [path] = getSmoothStepPath({
  //     sourceX,
  //     sourceY,
  //     targetX,
  //     targetY,
  //     borderRadius: 30,
  //   });

  //   return (
  //     <g
  //       onMouseEnter={() => setHovered(true)}
  //       onMouseLeave={() => setHovered(false)}
  //     >
  //       <BaseEdge id={id} path={path} />

  //       {/* Render caps */}
  //       <g transform={`translate(${sourceX}, ${sourceY}) rotate(0)`}>
  //         <path
  //           d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
  //           fill={sourceColor}
  //         />
  //       </g>

  //       <g transform={`translate(${targetX}, ${targetY}) rotate(180)`}>
  //         <path
  //           d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
  //           fill={targetColor}
  //         />
  //       </g>

  //       {renderEdgeActions((sourceX + targetX) / 2, (sourceY + targetY) / 2)}
  //     </g>
  //   );
  // }

  /* =====================================================================================
     3) CHILD → LOOP (N8N style rectangular loop-back)
  ===================================================================================== */
  // if (isLoopBack) {
  //   const loop = targetNode;
  //   const child = sourceNode;

  //   const L = loop.positionAbsolute;
  //   const C = child.positionAbsolute;

  //   const left = L.x - 120;
  //   const right = C.x + child.width + 120;
  //   const top = L.y + loop.height + 30;
  //   const bottom = C.y + child.height + 30;

  //   const path = `
  //     M ${C.x + child.width} ${C.y + child.height / 2}
  //     L ${right} ${C.y + child.height / 2}
  //     L ${right} ${bottom}
  //     L ${left} ${bottom}
  //     L ${left} ${L.y + loop.height / 2}
  //     L ${L.x} ${L.y + loop.height / 2}
  //   `;

  //   return (
  //     <g
  //       onMouseEnter={() => setHovered(true)}
  //       onMouseLeave={() => setHovered(false)}
  //     >
  //       <path d={path} stroke={sourceColor} strokeWidth={3} fill="none" />

  //       {/* caps */}
  //       <circle
  //         cx={C.x + child.width}
  //         cy={C.y + child.height / 2}
  //         r={6}
  //         fill={sourceColor}
  //       />

  //       <circle
  //         cx={L.x}
  //         cy={L.y + loop.height / 2}
  //         r={6}
  //         fill={targetColor}
  //       />

  //       {renderEdgeActions(right, bottom)}
  //     </g>
  //   );
  // }

  /* ---------------------------------------------------------------
     NORMAL EDGES (with dotted animation + half-caps)
  ----------------------------------------------------------------- */
  const [hitPath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 30,
  });

  // Circle centers
  const srcCX = sourceX - NODE_MAIN_RADIUS;
  const srcCY = sourceY;
  const tgtCX = targetX + NODE_MAIN_RADIUS;
  const tgtCY = targetY;

  // Direction vector
  const vx = tgtCX - srcCX;
  const vy = tgtCY - srcCY;
  const len = Math.sqrt(vx * vx + vy * vy) || 1;
  const ux = vx / len;
  const uy = vy / len;

  const srcAngle = (Math.atan2(uy, ux) * 180) / Math.PI;
  const tgtAngle = srcAngle + 180;

  // Cap origins
  const srcOX = srcCX + ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP);
  const srcOY = srcCY + uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

  const tgtOX = tgtCX - ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) + 10;
  const tgtOY = tgtCY - uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

  // Dotted segment start/end
  const startX = srcOX + ux * EDGE_CAP_RADIUS;
  const startY = srcOY + uy * EDGE_CAP_RADIUS;

  const endX = tgtOX - ux * EDGE_CAP_RADIUS;
  const endY = tgtOY - uy * EDGE_CAP_RADIUS;

  // Dots
  const dx = endX - startX;
  const dy = endY - startY;
  const dLen = Math.sqrt(dx * dx + dy * dy);
  const dCount = Math.floor(dLen / DOT_SPACING);

  const dots = [];
  for (let i = 1; i < dCount; i++) {
    const t = i / dCount;
    dots.push(
      <circle
        key={`dot-${i}`}
        cx={startX + dx * t}
        cy={startY + dy * t}
        r={DOT_RADIUS}
        fill={lerpColor(sourceColor, targetColor, t)}
      />
    );
  }
  const midX = sourceX + dx * 0.5;
  const midY = sourceY + dy * 0.5;
  /* ---------------------------------------------------------------
     RENDER NORMAL EDGE
  ----------------------------------------------------------------- */

  const labelX = startX + dx * 0.5;
  const labelY = startY + dy * 0.5;
  const labelAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const normalizedAngle = (labelAngle + 360) % 360;
  const displayAngle =
    normalizedAngle > 90 && normalizedAngle < 270
      ? normalizedAngle + 180
      : normalizedAngle;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      {/* hit area */}
      <BaseEdge
        id={id}
        path={hitPath}
        style={{ stroke: "transparent", strokeWidth: 25 }}
      />

      {/* dots */}
      {dots}

      {/* source cap */}
      <g transform={`translate(${srcOX}, ${srcOY}) rotate(${srcAngle})`}>
        <path
          d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
          fill={sourceColor}
        />
      </g>

      {/* target cap */}
      <g transform={`translate(${tgtOX}, ${tgtOY}) rotate(${tgtAngle})`}>
        <path
          d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
          fill={targetColor}
        />
      </g>
      {label &&
        renderEdgeLabel(labelX, labelY, displayAngle, formatName(label))}
      {renderEdgeActions(labelX, labelY, displayAngle)}
    </g>
  );
});

export default CustomEdge;
