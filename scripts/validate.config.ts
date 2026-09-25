/** 用 vite 的 SSR 构建把校验脚本打包成 Node 可直接执行的 ESM */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'scripts/validate-entry.ts',
    outDir: 'scripts/.out/validate',
    emptyOutDir: true,
    minify: false,
    target: 'node18',
    rollupOptions: {
      output: { entryFileNames: 'validate.mjs', format: 'es' },
    },
  },
});
