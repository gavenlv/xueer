import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'scripts/tmp-authors-entry.ts',
    outDir: 'scripts/.out/tmp',
    emptyOutDir: true,
    minify: false,
    target: 'node18',
    rollupOptions: { output: { entryFileNames: 'tmp.mjs', format: 'es' } },
  },
});
