import React from 'react';
export default function NodeSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; sourceNodeId?: string | null }) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-white border-l p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Add Node</div>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="text-sm text-gray-600">Drag nodes from here (placeholder)</div>
    </div>
  );
}
