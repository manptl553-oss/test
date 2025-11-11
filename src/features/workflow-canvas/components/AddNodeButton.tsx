import { Button } from "@/shared";
import { Plus } from "lucide-react";

interface AddNodeButtonProps {
  onClick: () => void;
}

const AddNodeButton = ({ onClick }: AddNodeButtonProps) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mt-20">
      <div className="bg-maastrichtblue border border-charcoal rounded-lg shadow-lg p-5 flex flex-wrap justify-center  items-center gap-3">
        <div className="text-white text-sm font-medium w-full text-center order-2">
          Start Workflow
        </div>
        <Button
          onClick={onClick}
          size="icon"
          className="h-10 w-10 rounded-full  shadow-md"
        >
          <div className="w-8 h-8 flex items-center justify-center order-1 bg-primary rounded-full">
            <Plus className="w-5 h-5 text-white" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export { AddNodeButton };
