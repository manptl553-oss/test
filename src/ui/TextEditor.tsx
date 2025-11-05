import JoditEditor from "jodit-react";
import type { Config } from "jodit/esm/config";
import type { DeepPartial } from "jodit/esm/types";
import React from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  width?: number;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 842,
}) => {
  const buttons = [
    "undo",
    "redo",
    "|",
    "bold",
    "strikethrough",
    "underline",
    "italic",
    "|",
    "superscript",
    "subscript",
    "|",
    "align",
    "|",
    "ul",
    "ol",
    "outdent",
    "indent",
    "|",
    "font",
    "fontsize",
    "brush",
    "paragraph",
    "|",
    "image",
    "link",
    "table",
    "|",
    "hr",
    "eraser",
    "copyformat",
    "|",
    "selectall",
    "source",
  ];

  const config: DeepPartial<Config> = {
    toolbar: true,
    spellcheck: true,
    language: "en",
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    buttons: buttons,
    uploader: { insertImageAsBase64URI: true },
    width: "100%",
    height,
  };

  return (
    <div className="relative overflow-visible z-[9999]">
      <JoditEditor
        value={value}
        config={config}
        // onChange={onChange}
        onBlur={(value: string) => onChange(value)}
      />
    </div>
  );
};

export default RichTextEditor;
