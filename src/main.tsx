import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import SyncBridge from './auth/SyncBridge';
import { StudyProvider } from './store/StudyContext';
// 注意：KaTeX 的样式不在这里全局引入——它只随 `components/Tex.tsx` 一起
// 按需加载（数学页才用得到），否则语文学生首屏会白下载一份用不上的字体与样式。
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('找不到 #root 挂载点');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <StudyProvider>
          {/* 登录后自动在本地与云端之间同步学习进度 */}
          <SyncBridge />
          <App />
        </StudyProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
