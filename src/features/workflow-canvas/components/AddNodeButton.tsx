import { PlusIcon } from "lucide-react";

export function AddNodeButton({
  onClick,
  isStartNode = false,
}: {
  onClick: () => void;
  isStartNode?: boolean;
}) {
  return (
    <>
      <div
        className={`w-32 h-32 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#22c55e] hover:bg-[#16a34a]
        `}
        onClick={onClick}
      >
        <PlusIcon />
      </div>
      {isStartNode && (
        <div className="text-black font-medium text-sm text-center">Start Workflow</div>
      )}
    </>
  );
}
