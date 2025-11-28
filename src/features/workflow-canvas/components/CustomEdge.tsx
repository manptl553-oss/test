import React, { JSX, memo, useMemo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  useStore,
} from "reactflow";
import { cn, NodeTypeProps, nodeTypeStyles } from "@/shared";
import { useFlowStore } from "@/store";
import { Plus, Unlink } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/* -------------------------------------------------------------------
   CONSTANTS
------------------------------------------------------------------- */
const DOT_SPACING = 10;
const DOT_RADIUS = 2;
const NODE_MAIN_RADIUS = 52;
const EDGE_CAP_RADIUS = 10;
const EDGE_CAP_GAP = -2;

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
  const allNodes = useMemo(() => Array.from(nodeInternals.values()), [nodeInternals]);

  const isSelf = source === target;

  const sourceColor =
    nodeTypeStyles[sourceNode?.data?.type as NodeTypeProps]?.bg ?? "#3b82f6";
  const targetColor =
    nodeTypeStyles[targetNode?.data?.type as NodeTypeProps]?.bg ?? "#10b981";

  const isSelfLoop = props?.data?.loopType === "self";
  const isLoopChild = props?.data?.loopType === "loop-child";
  const isLoopBack = props?.data?.loopType === "loop-back";

  const renderDottedSegment = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colorFrom: string,
    colorTo?: string,
    segmentIndex: number = 0
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    let count = Math.floor(len / DOT_SPACING);
    const MAX_DOTS = 220;
    
    if (count < 1) count = 0;
    if (count > MAX_DOTS) count = Math.floor(MAX_DOTS);

    const dots: JSX.Element[] = [];
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const color = colorTo ? lerpColor(colorFrom, colorTo, t) : colorFrom;
      
      // Calculate delay based on segment index and position in segment
      const delay = segmentIndex * 0.3 + t * 0.8;
      
      dots.push(
        <circle
          key={`dot-${Math.round(x1)}-${Math.round(y1)}-${i}`}
          cx={x1 + dx * t}
          cy={y1 + dy * t}
          r={DOT_RADIUS}
          fill={color}
        >
          {/* Flow animation - only opacity */}
          <animate
            attributeName="opacity"
            values="0.2;1;1;0.2"
            keyTimes="0;0.1;0.3;1"
            dur="3s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      );
    }
    return dots;
  };

  const handleAddNodeBetween = () => {
    const position = {
      x: (props?.sourceX + props?.targetX) / 2 - 20,
      y: (props?.sourceY + props?.targetY) / 2 - 20,
    };
    const id = uuidv4();

    const newNode = {
      id,
      type: "custom",
      position,
      data: { id, type: "addNode" },
    };

    addNodeBetweenEdge(newNode, props);
  };

  const handleUnlinkNodes = () => {
    deleteEdge(props.id);
  };

  const renderEdgeActions = (x: number, y: number) => (
    <EdgeLabelRenderer>
      <div
        style={{
          position: "absolute",
          transform: `translate(${x}px, ${y}px) translateX(-50%)`,
          pointerEvents: "none",
        }}
        className="wf-edge-action-layer nodrag nopan"
      >
        <div
          className={cn(
            "wf-edge-actions",
            hovered && "wf-edge-actions--visible"
          )}
          style={{ pointerEvents: "all" }}
        >
          <button
            onClick={handleAddNodeBetween}
            className="wf-edge-action-btn wf-edge-action-btn--add"
          >
            <Plus className="wf-edge-action-icon" />
          </button>

          <button
            onClick={handleUnlinkNodes}
            className="wf-edge-action-btn wf-edge-action-btn--remove"
          >
            <Unlink className="wf-edge-action-icon" />
          </button>
        </div>
      </div>
    </EdgeLabelRenderer>
  );

if (isSelfLoop) {
  const pos = sourceNode.positionAbsolute;
  const w = sourceNode.width;
  const h = sourceNode.height;

  // loop rectangle padding
  const padX = 80;
  const padY = 50;

  const left   = pos.x - padX;
  const right  = pos.x + w + padX;
  const top    = pos.y - padY;
  const bottom = pos.y + h + padY;
  const midY   = pos.y + h / 2;

  // build continuous path points (not segmented!)
  const points: {x:number, y:number}[] = [];

  const addSegment = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const count = Math.floor(len / DOT_SPACING);

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      points.push({
        x: x1 + dx * t,
        y: y1 + dy * t,
      });
    }
  };

  // build square path
  addSegment(pos.x + w, midY, right, midY);   // top
  addSegment(right, midY, right, bottom);     // right
  addSegment(right, bottom, left, bottom);    // bottom
  addSegment(left, bottom, left, midY);       // left
  addSegment(left, midY, pos.x, midY);        // back into node

  // Animate all dots in a single continuous motion
  const dots = points.map((p, idx) => (
    <circle
      key={`lp-${idx}`}
      cx={p.x}
      cy={p.y}
      r={DOT_RADIUS}
      fill={sourceColor}
    >
      <animate
        attributeName="opacity"
        values="0.2;1;1;0.2"
        dur="2.6s"
        begin={`${idx * 0.04}s`}
        repeatCount="indefinite"
      />
    </circle>
  ));

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {dots}

      {/* source node cap */}
      <circle cx={pos.x + w} cy={midY} r={6} fill={sourceColor} opacity={0.7}/>
      <circle cx={pos.x} cy={midY} r={6} fill={sourceColor} opacity={0.7}/>

      {renderEdgeActions((left + right)/2, bottom)}
    </g>
  );
}


  if (isLoopChild) {
    const srcCX = sourceX - NODE_MAIN_RADIUS;
    const srcCY = sourceY;
    const tgtCX = targetX + NODE_MAIN_RADIUS;
    const tgtCY = targetY;

    const vx = tgtCX - srcCX;
    const vy = tgtCY - srcCY;
    const len = Math.sqrt(vx * vx + vy * vy) || 1;
    const ux = vx / len;
    const uy = vy / len;

    const srcOX = srcCX + ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP);
    const srcOY = srcCY + uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

    const tgtOX = tgtCX - ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) + 10;
    const tgtOY = tgtCY - uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

    const startX = srcOX + ux * EDGE_CAP_RADIUS;
    const startY = srcOY + uy * EDGE_CAP_RADIUS;
    const endX = tgtOX - ux * EDGE_CAP_RADIUS;
    const endY = tgtOY - uy * EDGE_CAP_RADIUS;

    const dots = renderDottedSegment(startX, startY, endX, endY, sourceColor, targetColor, 0);

    return (
      <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {dots}

        <g transform={`translate(${startX}, ${startY}) rotate(0)`}>
          <path
            d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
            fill={sourceColor}
            opacity={0.6}
          />
        </g>

        <g transform={`translate(${endX}, ${endY}) rotate(180)`}>
          <path
            d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
            fill={targetColor}
          >
            <animate
              attributeName="opacity"
              values="0.3;1;1;0.3"
              keyTimes="0;0.1;0.2;1"
              dur="3s"
              begin="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {renderEdgeActions((startX + endX) / 2, (startY + endY) / 2)}
      </g>
    );
  }

if (isLoopBack) {
  const childX = sourceX;
  const childY = sourceY;
  const loopX = targetX;
  const loopY = targetY;

  const midChildY = childY;
  const midLoopY = loopY;

  const left  = Math.min(childX, loopX) - 120;
  const right = Math.max(childX, loopX) + 120;
  const bottom = Math.max(childY, loopY) + 80;

  const dot = (x: number, y: number, key: string) => (
    <circle key={key} cx={x} cy={y} r={DOT_RADIUS} fill={sourceColor} />
  );

  // gradient: source → target
  const segA = [
    dot(childX, midChildY, "A0"),
    ...renderDottedSegment(childX, midChildY, right, midChildY, sourceColor, targetColor, 0),
    dot(right, midChildY, "A1"),
  ];

  const segB = [
    dot(right, midChildY, "B0"),
    ...renderDottedSegment(right, midChildY, right, bottom, sourceColor, targetColor, 1),
    dot(right, bottom, "B1"),
  ];

  const segC = [
    dot(right, bottom, "C0"),
    ...renderDottedSegment(right, bottom, left, bottom, sourceColor, targetColor, 2),
    dot(left, bottom, "C1"),
  ];

  const segD = [
    dot(left, bottom, "D0"),
    ...renderDottedSegment(left, bottom, left, midLoopY, sourceColor, targetColor, 3),
    dot(left, midLoopY, "D1"),
  ];

  const segE = [
    dot(left, midLoopY, "E0"),
    ...renderDottedSegment(left, midLoopY, loopX, midLoopY, sourceColor, targetColor, 4),
    dot(loopX, midLoopY, "E1"),
  ];

  const midX = (left + right) / 2;
  const midY = bottom;

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {segA}
      {segB}
      {segC}
      {segD}
      {segE}

      {/* Start cap always from source */}
      <circle cx={childX} cy={midChildY} r={6} fill={sourceColor} opacity={0.6} />

      {/* End cap should be target */}
      <circle cx={loopX} cy={midLoopY} r={6} fill={targetColor}>
        <animate
          attributeName="opacity"
          values="0.3;1;1;0.3"
          keyTimes="0;0.1;0.2;1"
          dur="3s"
          begin="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {renderEdgeActions(midX, midY)}
    </g>
  );
}


  /* Normal edges */
  const [hitPath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: 30,
  });

  const srcCX = sourceX - NODE_MAIN_RADIUS;
  const srcCY = sourceY;
  const tgtCX = targetX + NODE_MAIN_RADIUS;
  const tgtCY = targetY;

  const vx = tgtCX - srcCX;
  const vy = tgtCY - srcCY;
  const len = Math.sqrt(vx * vx + vy * vy) || 1;
  const ux = vx / len;
  const uy = vy / len;

  const srcAngle = (Math.atan2(uy, ux) * 180) / Math.PI;
  const tgtAngle = srcAngle + 180;

  const srcOX = srcCX + ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP);
  const srcOY = srcCY + uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

  const tgtOX = tgtCX - ux * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) + 10;
  const tgtOY = tgtCY - uy * (NODE_MAIN_RADIUS + EDGE_CAP_GAP) - 10;

  const startX = srcOX + ux * EDGE_CAP_RADIUS;
  const startY = srcOY + uy * EDGE_CAP_RADIUS;

  const endX = tgtOX - ux * EDGE_CAP_RADIUS;
  const endY = tgtOY - uy * EDGE_CAP_RADIUS;

  const dx = endX - startX;
  const dy = endY - startY;
  const dLen = Math.sqrt(dx * dx + dy * dy);
  const dCount = Math.floor(dLen / DOT_SPACING);

  const dots = [];
  for (let i = 1; i < dCount; i++) {
    const t = i / dCount;
    const delay = t * 0.8;
    const fillColor =
  sourceColor === targetColor
    ? sourceColor
    : lerpColor(sourceColor, targetColor, t);
    dots.push(
      <circle
        key={`dot-${i}`}
        cx={startX + dx * t}
        cy={startY + dy * t}
        r={DOT_RADIUS}
        fill={fillColor}
      >
        <animate
          attributeName="opacity"
          values="0.3;1;1;0.3"
          keyTimes="0;0.1;0.3;1"
          dur="3s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        />
        {/* <animate
          attributeName="r"
          values={`${DOT_RADIUS};${DOT_RADIUS * 1.8};${DOT_RADIUS * 1.8};${DOT_RADIUS}`}
          keyTimes="0;0.1;0.3;1"
          dur="3s"
          begin={`${delay}s`}
          repeatCount="indefinite"
        /> */}
      </circle>
    );
  }

  const midX = sourceX + dx * 0.5;
  const midY = sourceY + dy * 0.5;

  return (
    <g onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <BaseEdge
        id={id}
        path={hitPath}
        style={{ stroke: "transparent", strokeWidth: 25 }}
      />

      {dots}

      <g transform={`translate(${srcOX}, ${srcOY}) rotate(${srcAngle})`}>
        <path
          d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
          fill={sourceColor}
        >
          <animate
            attributeName="opacity"
            values="0.5;1;1;0.5"
            keyTimes="0;0.1;0.2;1"
            dur="3s"
            repeatCount="indefinite"
          />
          {/* <animateTransform
            attributeName="transform"
            // type="scale"
            values="1;1.3;1.3;1"
            keyTimes="0;0.1;0.2;1"
            dur="3s"
            repeatCount="indefinite"
          /> */}
        </path>
      </g>

      <g transform={`translate(${tgtOX}, ${tgtOY}) rotate(${tgtAngle})`}>
        <path
          d={`M 0 -${EDGE_CAP_RADIUS} A ${EDGE_CAP_RADIUS} ${EDGE_CAP_RADIUS} 0 0 1 0 ${EDGE_CAP_RADIUS} Z`}
          fill={targetColor}
        >
          <animate
            attributeName="opacity"
            values="0.5;1;1;0.5"
            keyTimes="0;0.1;0.2;1"
            dur="3s"
            begin="0.8s"
            repeatCount="indefinite"
          />
          {/* <animateTransform
            attributeName="transform"
            // type="scale"
            values="1;1.3;1.3;1"
            keyTimes="0;0.1;0.2;1"
            dur="3s"
            begin="0.8s"
            repeatCount="indefinite"
          /> */}
        </path>
      </g>

      {renderEdgeActions(midX, midY)}
    </g>
  );
});

export default CustomEdge;