import { useEffect, useRef, useState } from "react";
import { cn } from "../utils";

interface EditableNodeNameProps {
  nodeName: string;
  onRename?: (newName: string) => void;
  className?: string;
  inputClassName?: string;
  spanClassName?: string;
}

const EditableNodeName = ({
  nodeName,
  onRename,
  className,
  inputClassName,
  spanClassName,
}: EditableNodeNameProps) => {
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
      className={cn("flex items-center gap-1", className)}
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
          className={cn(
            "border border-(--wf-border-default) rounded px-1 py-0.5 text-sm",
            "bg-(--wf-background-subtle) text-(--wf-text-default)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--wf-border-focus) focus-visible:ring-offset-1 ring-offset-(--wf-background-base)",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            inputClassName
          )}
        />
      ) : (
        <span
          className={cn(
            "text-sm font-medium cursor-text px-1 rounded transition",
            "text-(--wf-text-default) hover:bg-(--wf-background-subtle)",
            spanClassName
          )}
        >
          {nodeName}
        </span>
      )}
    </div>
  );
};

export { EditableNodeName };
