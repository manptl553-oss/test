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

  css: {
    postcss: './postcss.config.js',
  },

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
      ],

      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },

        assetFileNames: (assetInfo) => {
          // Generate CSS with the correct name
          if (assetInfo.name === 'style.css') {
            return 'bit-workflow-engine.css'; // Match your package.json exports
          }
          return assetInfo.name || 'assets/[name][extname]';
        },

        preserveModules: false,
        exports: 'named',
      },

      treeshake: {
        moduleSideEffects: false,
      },
    },

    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: true,
    emptyOutDir: true,
    cssCodeSplit: false,
    target: 'es2020',
  },
});