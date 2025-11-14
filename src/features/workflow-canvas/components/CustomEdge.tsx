import  { memo } from "react";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
} from "reactflow";

const CustomEdge = memo((props: EdgeProps) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    selected,
  } = props;



  const [edgePath, midX, midY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 14,
  });



  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const pathLength = Math.sqrt(dx * dx + dy * dy);

  const dotSpacing = 12;
  const dotRadius = 4;
  const dotCount = Math.max(5, Math.floor(pathLength / dotSpacing) - 1);

  const startColor = { r: 111, g: 207, b: 151 }; // light green
  const endColor = { r: 198, g: 230, b: 196 };   // pale green

  const dots = [];

  for (let i = 1; i <= dotCount; i++) {
    const t = i / (dotCount + 1);

    const x = sourceX + dx * t;
    const y = sourceY + dy * t;

    const r = Math.round(startColor.r * (1 - t) + endColor.r * t);
    const g = Math.round(startColor.g * (1 - t) + endColor.g * t);
    const b = Math.round(startColor.b * (1 - t) + endColor.b * t);

    dots.push(<circle key={i} cx={x} cy={y} r={dotRadius} fill={`rgb(${r},${g},${b})`} />);
  }

  return (
    <>
      <g>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: "transparent",
            strokeWidth: 20,
            pointerEvents: "stroke",
          }}
        />
        {dots}
      </g>
    </>
  );
});

CustomEdge.displayName = "CustomEdge";
export default CustomEdge;
