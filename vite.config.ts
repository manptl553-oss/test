import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx', '**/*.spec.tsx'],
      entryRoot: 'src',
      rollupTypes: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BitWorkflowEngine',
      formats: ['es', 'cjs'],
      fileName: (format) => `src/index.${format === 'es' ? 'js' : 'cjs'}`,
    },

    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@headlessui/react',
        '@hookform/resolvers',
        '@monaco-editor/react',
        'class-variance-authority',
        'clsx',
        'dagre',
        'framer-motion',
        'jodit-react',
        'lucide-react',
        'react-hook-form',
        'react-resizable-panels',
        'reactflow',
        'tailwind-merge',
        'tailwindcss-animate',
        'zod',
        'zustand',
        "react-select"
      ],

      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },

        // This ensures the CSS file is always named correctly
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'bit-workflow-engine.css') {
            return 'bit-workflow-engine.css'; // matches package.json export
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },

    // These 4 lines are the most important changes
    cssCodeSplit: false,        // ← Force all CSS into ONE static file
    minify: 'esbuild',
    sourcemap: true,
    emptyOutDir: true,
    target: 'es2020',
    outDir: 'dist',
  },
});