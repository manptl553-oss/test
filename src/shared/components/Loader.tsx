
type CanvasLoaderProps = {
  color?: string;     // hex, rgb, tailwind, etc.
  size?: number;      // px
};

const CanvasLoader = ({ color = "#4c8bf5", size = 48 }: CanvasLoaderProps) => {
  const thickness = Math.max(3, size * 0.1);

  return (
    <div className="wf-loader-overlay">
      <div
        className="wf-loader-spinner"
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
          borderColor: `${color}30`, // 30 = light opacity background
          borderBottomColor: color,
        }}
      />
    </div>
  );
};

export default CanvasLoader;
