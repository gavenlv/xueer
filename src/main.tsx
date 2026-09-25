import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { StudyProvider } from './store/StudyContext';
import 'katex/dist/katex.min.css';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('找不到 #root 挂载点');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HashRouter>
      <StudyProvider>
        <App />
      </StudyProvider>
    </HashRouter>
  </React.StrictMode>,
);
