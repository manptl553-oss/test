import  { memo, useCallback, useMemo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  useStore,
} from "reactflow";
import { cn, formatName, getEdgeLabel, NodeTypeProps } from "@/shared";
import { useFlowStore } from "@/store";
import { Plus, Unlink } from "lucide-react";

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

  const { deleteEdge, addNodeBetweenEdge, nodeTypeMeta } = useFlowStore();
  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  const allNodes = useMemo(
    () => Array.from(nodeInternals.values()),
    [nodeInternals]
  );
  const label = getEdgeLabel(props?.sourceHandleId ?? undefined);


  const sourceColor =
    nodeTypeMeta.get(sourceNode?.data?.type as NodeTypeProps)?.color ??
    "#3b82f6";

  const targetColor =
    nodeTypeMeta.get(targetNode?.data?.type as NodeTypeProps)?.color ??
    "#6B7280";


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
            "wf-edge-actions",
            hovered ? "wf-edge-actions--visible" : "wf-edge-actions--hidden"
          )}
          style={{ pointerEvents: "all" }}
        >
          <button
            onClick={handleAddNodeBetween}
            className="wf-edge-btn wf-btn-green"
          >
            <Plus className="wf-edge-icon" />
          </button>

          <button
            onClick={handleUnlinkNodes}
            className="wf-edge-btn wf-btn-red"
          >
            <Unlink className="wf-edge-icon" />
          </button>
        </div>
      </div>
    </EdgeLabelRenderer>
  );

  const renderEdgeLabel = useCallback(
    (x: number, y: number, angleDeg: number, text: string) => {
      const offset = 20;
      const rad = (angleDeg * Math.PI) / 180;

      const offsetX = Math.sin(rad) * offset;
      const offsetY = -Math.cos(rad) * offset;

      return (
        <EdgeLabelRenderer>
          <div
            className="absolute nodrag nopan wf-edge-label-wrapper"
            style={{
              transform: `translate(${x + offsetX}px, ${y + offsetY}px)
                translate(-50%, -50%)
                rotate(${angleDeg}deg)`,
            }}
          >
            <span className="wf-edge-label">{text}</span>
          </div>
        </EdgeLabelRenderer>
      );
    },
    []
  );


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
