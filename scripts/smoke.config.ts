/** 用 vite 的 SSR 构建把渲染冒烟测试打包成 Node 可执行文件 */

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'scripts/smoke-entry.tsx',
    outDir: 'scripts/.out/smoke',
    emptyOutDir: true,
    minify: false,
    target: 'node18',
    rollupOptions: {
      output: { entryFileNames: 'smoke.mjs', format: 'es' },
    },
  },
});
