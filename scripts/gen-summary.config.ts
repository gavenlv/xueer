/** 用 vite 的 SSR 构建把「生成轻量清单」脚本打包成 Node 可直接执行的 ESM */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'scripts/gen-summary.ts',
    outDir: 'scripts/.out/gen',
    emptyOutDir: true,
    minify: false,
    target: 'node18',
    rollupOptions: {
      output: { entryFileNames: 'gen.mjs', format: 'es' },
    },
  },
});
