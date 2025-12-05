import React, { JSX, memo, useCallback, useMemo, useState } from "react";
import {
  EdgeLabelRenderer,
  EdgeProps,
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

const NODE_MAIN_RADIUS = 52; 
const EDGE_CAP_RADIUS = 10; 
const EDGE_CAP_GAP = -2; 
const HIT_STROKE_WIDTH = 30; // Thicker invisible stroke for easier hovering

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
   HELPER: Generate Dots
------------------------------------------------------------------- */
const renderPolylineDots = (points: { x: number; y: number }[], color1: string, color2: string) => {
  if (points.length < 2) return [];

  let totalLength = 0;
  const segmentLengths: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }

  const dots: JSX.Element[] = [];
  let currentDist = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segLen = segmentLengths[i];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const count = Math.floor(segLen / DOT_SPACING);

    for (let j = 0; j <= count; j++) {
      const segT = j / count; 
      const x = p1.x + dx * segT;
      const y = p1.y + dy * segT;

      const distCovered = currentDist + (segLen * segT);
      const globalT = Math.min(1, Math.max(0, distCovered / totalLength));

      dots.push(
        <circle
          key={`poly-dot-${i}-${j}`}
          cx={x}
          cy={y}
          r={DOT_RADIUS}
          fill={lerpColor(color1, color2, globalT)}
        />
      );
    }
    currentDist += segLen;
  }

  return dots;
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

  if (!sourceNode || !targetNode) return null;

  const label = getEdgeLabel(props?.sourceHandleId ?? undefined);

  const sourceColor =
    nodeTypeMeta.get(sourceNode?.data?.type as NodeTypeProps)?.color ??
    "#3b82f6";

  const targetColor =
    nodeTypeMeta.get(targetNode?.data?.type as NodeTypeProps)?.color ??
    "#6B7280";

  const isSelfLoop = props?.data?.loopType === "self";
  const isLoopChild = props?.data?.loopType === "loop-child";
  const isLoopBack = props?.data?.loopType === "loop-back";

  const handleAddNodeBetween = () => {
    let position = { x: 0, y: 0 };
    if (isSelfLoop || isLoopBack) {
      position = {
        x: (sourceNode.positionAbsolute?.x ?? 0) + 260,
        y: sourceNode.positionAbsolute?.y ?? 0,
      };
    } else {
      position = {
        x: (props.sourceX + props.targetX) / 2 - 20,
        y: (props.sourceY + props.targetY) / 2 - 20,
      };
    }

    addNodeBetweenEdge(position, {
      ...props,
      sourceHandle: props.sourceHandleId,
      targetHandle: props.targetHandleId,
    });
  };

  const handleUnlinkNodes = () => {
    deleteEdge(props.id);
  };

  const renderEdgeActions = (x: number, y: number, angleDeg: number) => {
    const offset = 20;
    const rad = (angleDeg * Math.PI) / 180;
    const offsetX = Math.sin(rad) * offset;
    const offsetY = -Math.cos(rad) * offset;
    
    return (
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(${x - offsetX}px, ${y - offsetY}px) translate(-50%, -50%) rotate(${angleDeg}deg)`,
            pointerEvents: "none",
            zIndex: 1001, // Ensure on top
          }}
          className="absolute nodrag nopan"
        >
          <div
            className={cn(
              "wf-edge-actions",
              hovered ? "wf-edge-actions--visible" : "wf-edge-actions--hidden"
            )}
            style={{ pointerEvents: "all" }}
            onMouseEnter={() => setHovered(true)} // Keep hovered when moving to buttons
          >
            <button onClick={handleAddNodeBetween} className="wf-edge-btn wf-btn-green">
              <Plus className="wf-edge-icon" />
            </button>
            <button onClick={handleUnlinkNodes} className="wf-edge-btn wf-btn-red">
              <Unlink className="wf-edge-icon" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    );
  };

  const renderEdgeLabel = useCallback(
    (x: number, y: number, angleDeg: number, text: string) => {
      const offset = 20;
      const rad = (angleDeg * Math.PI) / 180;
      const offsetX = Math.sin(rad) * offset;
      const offsetY = -Math.cos(rad) * offset;

      return (
        <EdgeLabelRenderer>
          <div
            className="wf-edge-label-wrapper"
            style={{
              transform: `translate(${x + offsetX}px, ${y + offsetY}px) translate(-50%, -50%) rotate(${angleDeg}deg)`,
              pointerEvents: "none",
            }}
          >
            <span className="wf-edge-label">{text}</span>
          </div>
        </EdgeLabelRenderer>
      );
    },
    []
  );

  /* =====================================================================================
     1) SELF LOOP
  ===================================================================================== */
   if (isSelfLoop) {
      const pos = sourceNode.positionAbsolute || { x: 0, y: 0 };
      // Use measured width if available for accuracy, else fallback
      const width = sourceNode.width || 120;
      const height = sourceNode.height || 40;

      const left = pos.x - 80;
      const right = pos.x + width + 80;
      const bottom = pos.y + height + 60; // Increased spacing slightly
      const startY = pos.y + height / 2;

      // Define path segments for dots
      const points = [
        { x: pos.x + width, y: startY }, 
        { x: right, y: startY },         
        { x: right, y: bottom },         
        { x: left, y: bottom },          
        { x: left, y: startY },          
        { x: pos.x, y: startY }          
      ];

      const hitPath = `
        M ${points[0].x} ${points[0].y}
        L ${points[1].x} ${points[1].y}
        L ${points[2].x} ${points[2].y}
        L ${points[3].x} ${points[3].y}
        L ${points[4].x} ${points[4].y}
        L ${points[5].x} ${points[5].y}
      `;
      
      // Calculate exact center of the bottom segment
      const centerX = (left + right) / 2;

      return (
        <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {/* Thick invisible path for interaction */}
          <path d={hitPath} stroke="transparent" strokeWidth={HIT_STROKE_WIDTH} fill="none" />
          
          {renderPolylineDots(points, sourceColor, sourceColor)}
          
          {/* Angle 0, but we manually position it on the line */}
          {renderEdgeActions(centerX, bottom, 0)}
        </g>
      );
    }

  /* =====================================================================================
     COMMON CALCULATION FOR STRAIGHT LINES (Loop Child & Normal)
  ===================================================================================== */
  // 1. Vector Math
  const srcCX = sourceX - NODE_MAIN_RADIUS;
  const srcCY = sourceY;
  const tgtCX = targetX + NODE_MAIN_RADIUS;
  const tgtCY = targetY;

  const vx = tgtCX - srcCX;
  const vy = tgtCY - srcCY;
  const len = Math.sqrt(vx * vx + vy * vy) || 1;
  const ux = vx / len;
  const uy = vy / len;

  // 2. Cap Centers (Origin)
  const srcOX = srcCX + ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP);
  const srcOY = srcCY + uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;
  const tgtOX = tgtCX - ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) + 10;
  const tgtOY = tgtCY - uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

  // 3. Dot Line Start/End
  const startX = srcOX + ux * EDGE_CAP_RADIUS;
  const startY = srcOY + uy * EDGE_CAP_RADIUS;
  const endX = tgtOX - ux * EDGE_CAP_RADIUS;
  const endY = tgtOY - uy * EDGE_CAP_RADIUS;

  const points = [{x: startX, y: startY}, {x: endX, y: endY}];
  const srcAngle = (Math.atan2(uy, ux) * 180) / Math.PI;
  const tgtAngle = srcAngle + 180;

  // 4. Hit Path Construction - STRAIGHT LINE matching visuals exactly
  // We draw the hit path from Cap Center to Cap Center to cover the whole gap
  const straightHitPath = `M ${srcOX} ${srcOY} L ${tgtOX} ${tgtOY}`;

  /* =====================================================================================
     2) LOOP → CHILD 
  ===================================================================================== */
  if (isLoopChild) {
    return (
      <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
         {/* HIT AREA: Line + Caps */}
        <path d={straightHitPath} stroke="transparent" strokeWidth={HIT_STROKE_WIDTH} />
        <circle cx={srcOX} cy={srcOY} r={20} fill="transparent" />
        <circle cx={tgtOX} cy={tgtOY} r={20} fill="transparent" />

        {/* Visuals */}
        {renderPolylineDots(points, sourceColor, targetColor)}
        <g transform={`translate(${srcOX}, ${srcOY}) rotate(${srcAngle})`}>
          <path d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`} fill={sourceColor} />
        </g>
        <g transform={`translate(${tgtOX}, ${tgtOY}) rotate(${tgtAngle})`}>
          <path d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`} fill={targetColor} />
        </g>

        {renderEdgeActions((srcOX + tgtOX) / 2, (srcOY + tgtOY) / 2, 0)}
      </g>
    );
  }

  /* =====================================================================================
     3) CHILD → LOOP (Loop Back)
  ===================================================================================== */
  if (isLoopBack) {
    const loop = targetNode;
    const child = sourceNode;

    const L = loop.positionAbsolute || { x: 0, y: 0 };
    const C = child.positionAbsolute || { x: 0, y: 0 };
    
    const childWidth = child.width || 120;
    const childHeight =  child.height || 40;
    const loopHeight =  loop.height || 40;

    const left = L.x - 120;
    const right = C.x + childWidth + 120;
    const bottom = Math.max(C.y + childHeight, L.y + loopHeight) + 60;
    const endY = L.y + loopHeight / 2;
    const startY = C.y + childHeight / 2;

    const polyPoints = [
      { x: C.x + childWidth, y: startY },
      { x: right, y: startY }, 
      { x: right, y: bottom }, 
      { x: left, y: bottom },  
      { x: left, y: endY },   
      { x: L.x, y: endY }      
    ];

    const hitPathStr = `
      M ${polyPoints[0].x} ${polyPoints[0].y}
      L ${polyPoints[1].x} ${polyPoints[1].y}
      L ${polyPoints[2].x} ${polyPoints[2].y}
      L ${polyPoints[3].x} ${polyPoints[3].y}
      L ${polyPoints[4].x} ${polyPoints[4].y}
      L ${polyPoints[5].x} ${polyPoints[5].y}
    `;

    return (
      <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <path d={hitPathStr} stroke="transparent" strokeWidth={HIT_STROKE_WIDTH} fill="none" />
        
        {renderPolylineDots(polyPoints, sourceColor, targetColor)}
        <circle cx={polyPoints[0].x} cy={polyPoints[0].y} r={6} fill={sourceColor} />
        <circle cx={polyPoints[5].x} cy={polyPoints[5].y} r={6} fill={targetColor} />

        {renderEdgeActions(right, bottom, 0)}
      </g>
    );
  }

  /* =====================================================================================
     4) NORMAL EDGES
  ===================================================================================== */
  // Label Calculations
  const dx = endX - startX;
  const dy = endY - startY;
  const labelAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const normalizedAngle = (labelAngle + 360) % 360;
  const displayAngle =
    normalizedAngle > 90 && normalizedAngle < 270
      ? normalizedAngle + 180
      : normalizedAngle;

  const labelX = startX + dx * 0.5;
  const labelY = startY + dy * 0.5;

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      
      {/* 
         FIX: Removed BaseEdge / getSmoothStepPath. 
         Used a straight invisible path that matches the visual dots exactly.
      */}
      <path 
        d={straightHitPath} 
        stroke="transparent" 
        strokeWidth={HIT_STROKE_WIDTH} 
        fill="none"
      />
      {/* Large hover targets at endpoints to fix "hover not working at start/end" */}
      <circle cx={srcOX} cy={srcOY} r={20} fill="transparent" />
      <circle cx={tgtOX} cy={tgtOY} r={20} fill="transparent" />

      {/* Visuals */}
      {renderPolylineDots(points, sourceColor, targetColor)}

      <g transform={`translate(${srcOX}, ${srcOY}) rotate(${srcAngle})`}>
        <path d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`} fill={sourceColor} />
      </g>

      <g transform={`translate(${tgtOX}, ${tgtOY}) rotate(${tgtAngle})`}>
        <path d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`} fill={targetColor} />
      </g>
      
      {label && renderEdgeLabel(labelX, labelY, displayAngle, formatName(label))}
      {renderEdgeActions(labelX, labelY, displayAngle)}
    </g>
  );
});

export default CustomEdge;