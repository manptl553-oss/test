import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,

  // Only React and React-DOM should be external (peer deps)
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
  ],
  
  // Everything else will be bundled
  noExternal: [
    "sonner",
    "lucide-react",
    "framer-motion",
    "react-resizable-panels",
    "@monaco-editor/react",
    "axios",
    "dagre",
    "date-fns",
    "zod"
  ],
  
  esbuildOptions(options) {
    options.jsx = "automatic";
    options.external = ["form-data"]; // 👈 Exclude form-data completely
  },
  
  treeshake: true,
  minify: false, // Set to true for production
  splitting: false,
});