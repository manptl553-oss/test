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
      className={cn("wf-editable-name", className)}
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
          className={cn("wf-editable-name__input", inputClassName)}
        />
      ) : (
        <span className={cn("wf-editable-name__label", spanClassName)}>
          {nodeName}
        </span>
      )}
    </div>
  );
};

export { EditableNodeName };
