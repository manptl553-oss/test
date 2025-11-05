import Editor from "@monaco-editor/react";
import { editor } from "monaco-editor";

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
    ...userOptions
  };
  return (
    <Editor
      height="250px"
      language={selectedLanguage}
      theme={selectedLanguage === "python" ? "vs-light" : "vs-dark"}
      value={value ?? ""}
      onChange={(val) => onChange(val || "")}
      onMount={(editor) => setTimeout(() => editor.focus(), 200)}
      options={options}
    />
  );
}
