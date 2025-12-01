import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useEffect, useState } from "react";

export function CodeEditor({
  selectedLanguage,
  value,
  onChange,
  userOptions = {},
}: {
  selectedLanguage: string;
  value: string;
  onChange: (value: string) => void;
  userOptions?: editor.IStandaloneEditorConstructionOptions;
}) {
  const [theme, setTheme] = useState("vs-dark");

  // detect color mode based on CSS variable or WorkflowProvider
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const bg = root.getPropertyValue("--wf-background-base")?.trim();

    // crude detection (can be improved by context hook later)
    if (!bg) return;

    const isDark =
      bg.startsWith("#0") ||
      bg.startsWith("#1") ||
      bg.startsWith("#2") ||
      bg === "black";

    setTheme(isDark ? "vs-dark" : "vs-light");
  }, []);

  const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: "on",
    formatOnPaste: true,
    formatOnType: true,
    insertSpaces: true,
    detectIndentation: false,
    renderWhitespace: "boundary",
    autoIndent: "advanced",
    quickSuggestions: true,
    acceptSuggestionOnCommitCharacter: false,
    acceptSuggestionOnEnter: "smart",
    suggestOnTriggerCharacters: false,
    snippetSuggestions: "inline",
    suggest: {
      showWords: true,
      showSnippets: false,
    },
    parameterHints: {
      enabled: false,
    },
    ...userOptions,
  };

  return (
    <div
      className="
        rounded-md overflow-hidden 
        border border-(--wf-border-default)
        bg-(--wf-background-subtle)
      "
    >
      <Editor
        height="250px"
        language={selectedLanguage}
        theme={theme}
        value={value ?? ""}
        onChange={(val) => onChange(val || "")}
        onMount={(editor) => setTimeout(() => editor.focus(), 200)}
        options={options}
      />
    </div>
  );
}
