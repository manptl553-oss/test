import { useEffect, useRef, useState } from "react";
interface EditableNodeNameProps {
  nodeName: string;
  onRename?: (newName: string) => void;
}

const EditableNodeName = ({ nodeName, onRename }: EditableNodeNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(nodeName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className="flex items-center gap-1"
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onRename?.(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              onRename?.(value);
            }
          }}
          className="border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <span className="text-sm font-medium cursor-text hover:bg-gray-100 px-1 rounded transition">
          {nodeName}
        </span>
      )}
    </div>
  );
};

export { EditableNodeName };
