import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui';
export default function AddNodeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mt-20">
      <div className="bg-[var(--wf-surface)] border border-[var(--wf-border)] rounded-lg shadow p-5 flex flex-wrap justify-center items-center gap-3">
        <div className="text-sm font-medium w-full text-center order-2">Start Workflow</div>
        <Button onClick={onClick} className="h-10 w-10 rounded-full shadow-md flex items-center justify-center">
          <Plus className="w-5 h-5 text-white" />
        </Button>
      </div>
    </div>
  );
}
