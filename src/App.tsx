/**
 * 路由表。
 *
 * 页面本身**不做懒加载**：它们每一个只有几 KB，拆出去省不下多少，却会让
 * 服务端渲染（`pnpm smoke` 用 `renderToString` 逐条路由验证）只能拿到
 * Suspense 占位符、看不到真实内容，等于把最有价值的一层回归测试弄瞎。
 * 真正的大块头是**内容数据**与 **KaTeX**，它们分别在数据层与 `DetailPage`
 * 的详情渲染器里按需加载（见 `pages/DetailPage.tsx` 的 lazy 与
 * `components/RichText.tsx` 的动态 import）。
 */

import { Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import SubjectPage from './pages/SubjectPage';
import ModulePage from './pages/ModulePage';
import DetailPage from './pages/DetailPage';
import PracticePage from './pages/PracticePage';
import WrongBook from './pages/WrongBook';
import StatsPage from './pages/StatsPage';
import ExtrasPage from './pages/ExtrasPage';
import RecitePage from './pages/RecitePage';
import ExamPage from './pages/ExamPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="s/:subjectId" element={<SubjectPage />} />
        <Route path="s/:subjectId/:moduleId" element={<ModulePage />} />
        <Route path="s/:subjectId/:moduleId/:itemId" element={<DetailPage />} />
        <Route path="practice/:moduleId" element={<PracticePage />} />
        <Route path="practice/:moduleId/:itemId" element={<PracticePage />} />
        <Route path="wrong" element={<WrongBook />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="extras" element={<ExtrasPage />} />
        <Route path="recite" element={<RecitePage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
