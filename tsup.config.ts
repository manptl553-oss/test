import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'reactflow', '@tanstack/react-query', 'zustand', 'lucide-react', 'zod', 'axios']
});
