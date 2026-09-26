import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 相对路径：部署到任意子目录都不用改配置
  // 注意：ES 模块无法通过 file:// 加载，dist 需用 `pnpm preview` 或任意静态服务器访问
  base: './',
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        /**
         * 把「基本不变的框架代码」与「几乎每次改内容都会变的业务数据」拆成两个块。
         *
         * 这个应用**绝大部分体积是内容数据**（诗词、文言文、阅读、作文、名著……），
         * 每次补充内容这些字节都会变、文件名哈希都会变；如果 React 与路由库也混在
         * 同一个块里，学生每次更新都要重新下载框架那部分。
         * 拆开之后：只改内容时，框架块的文件名不变、浏览器直接命中缓存。
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/katex/')) return 'katex';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) {
            return 'react';
          }
          if (id.includes('/react-router')) return 'router';
          return 'vendor';
        },
      },
    },
  },
});
